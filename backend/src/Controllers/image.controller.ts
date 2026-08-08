import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { uploadImageBufferToPinata, uploadMetadataToPinata } from "../Utils/pinata.js";
import { uploadBufferToCloudinary } from "../Utils/cloudinary.js";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import { Image } from "../Models/image.models.js";
import { ethers } from "ethers";
import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";
import config from "../config/config.js";
import { Activity } from "../Models/activity.models.js";


interface IUploadImage {
    title: string;
    description: string;
    assetCategory: string;
    tags?: string;
}

interface IConfirmMintPayload {
    title: string;
    description: string;
    assetCategory: string;
    tags: string[];
    fileDetails: {
        fileType: string;
        fileSize: number;
        width: number;
        height: number;
    };
    imageHash: string;
    watermarkID: string;
    imageCID: string;
    metadataCID: string;
    thumbnailUrl: string;
    transactionHash: string;
    originalAssetHash: string;
}


/**
 * @route POST /api/v1/images/drafts
 * @description Processes image, injects watermark, uploads to Cloudinary & IPFS.
 */
const uploadAndGenerateProvenance = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) throw new ApiError(401, "Unauthorized request. user missing.");

    const {title, description, assetCategory, tags} = req.body as IUploadImage;

    if(!title || !description || !assetCategory) {
        throw new ApiError(400, "Title, description, and assetCategory are required.");
    }
    if(!req.file || !req.file.buffer) {
        throw new ApiError(400, "Image file is required and must be in memory buffer");
    }

    const mimeMap: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/webp': 'webp',
        'image/bmp': 'bmp'
    };
    const mimeType = mimeMap[req.file.mimetype] ? req.file.mimetype : 'image/jpeg';
    const ext = mimeMap[mimeType] || 'jpg';

    const rawUint8Array = new Uint8Array(req.file.buffer);
    const incomingFileHash = ethers.keccak256(rawUint8Array);

    const [existedOriginalImage, existedMintedImage] = await Promise.all([
        Image.findOne({originalAssetHash: incomingFileHash}).lean(),
        Image.findOne({imageHash: incomingFileHash}).lean()
    ]);

    if(existedOriginalImage) throw new ApiError(409, "Plagiarism Detected: Original image already registered.");
    if(existedMintedImage) throw new ApiError(409, "Copyright Violation: Minted asset already registered.");

    console.log("Analyzing image for hidden ProveNode DNA...");
    const extractionForm = new FormData();
    
    extractionForm.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
    });

    try {
        const extractResponse = await axios.post(`${config.watermarkEngineUrl}/extract-watermark`, extractionForm, {
            headers: { ...extractionForm.getHeaders() }
        });

        if (extractResponse.data && extractResponse.data.status === "found" && extractResponse.data.watermark_id) {
            const foundCoreDNA = extractResponse.data.watermark_id; 
            if (!/^0+$/.test(foundCoreDNA)) {
                const formattedWatermarkID = foundCoreDNA.startsWith('0x') ? foundCoreDNA : `0x${foundCoreDNA}`;
                const existedAsset = await Image.findOne({ watermarkID: formattedWatermarkID }).lean();

                if (existedAsset) {
                    throw new ApiError(409, `Copyright Violation: Image contains DNA of an existing ProveNode asset.`);
                }
            }
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to analyze image for existing copyrights.");
    }

    const parsedTags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
    const coreWatermarkID = crypto.randomBytes(4).toString('hex');
    const watermarkID = `0x${coreWatermarkID}`;
    const embedForm = new FormData();

    embedForm.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
    });
    embedForm.append('watermark_id', coreWatermarkID);

    let watermarkedImageBuffer: Buffer;
    try {
        console.log("Injecting DNA via Python Microservice...");
        const pythonResponse = await axios.post(`${config.watermarkEngineUrl}/embed-watermark`, embedForm, {
            headers: { ...embedForm.getHeaders()},
            responseType: "arraybuffer" 
        });
        watermarkedImageBuffer = pythonResponse.data;
    } catch (error) {
        throw new ApiError(500, "Failed to inject invisible watermark via Python Engine.");
    }

    const imageHash = ethers.keccak256(new Uint8Array(watermarkedImageBuffer));

    console.log("Generating Thumbnail & Uploading to Cloudinary & Pinata...");
    
    const cloudinaryUploadPromise = uploadBufferToCloudinary(watermarkedImageBuffer, {
        folder: "thumbnails",
        format: "webp",
        width: 800,
        crop: "limit",
        quality: 80
    });

    const pinataUploadPromise = uploadImageBufferToPinata(
        watermarkedImageBuffer, 
        `${title.replace(/\s+/g, '_')}_provenode.${ext}`, 
        mimeType
    );

    const [cloudinaryResponse, pinataImgCID] = await Promise.all([
        cloudinaryUploadPromise,
        pinataUploadPromise
    ]);

    if (!cloudinaryResponse?.secure_url) throw new ApiError(500, "Failed to generate UI thumbnail.");
    if (!pinataImgCID) throw new ApiError(500, "Failed to upload raw image to IPFS.");

    const fileDetails = {
        fileType: mimeType,
        fileSize: watermarkedImageBuffer.length,
        width: cloudinaryResponse.width,
        height: cloudinaryResponse.height
    };

    console.log("Uploading JSON Metadata to Pinata...");
    const metadataCID = await uploadMetadataToPinata(
        title, 
        description, 
        pinataImgCID,
        assetCategory,
        parsedTags,
        fileDetails, 
        watermarkID, 
        imageHash 
    );

    if (!metadataCID) throw new ApiError(500, "Failed to upload JSON metadata to IPFS.");

    console.log("Pipeline Complete! Dispatching Payload to Frontend.");
    return res.status(200).json(
        new ApiResponse(200, {
            imageHash,
            watermarkID,
            metadataCID,
            thumbnailUrl: cloudinaryResponse.secure_url,
            ipfsImageUrl: `https://gateway.pinata.cloud/ipfs/${pinataImgCID}`,
            preparedData: {
                title, 
                description,
                assetCategory,
                tags: parsedTags,
                fileDetails,
                originalAssetHash: incomingFileHash 
            }
        }, "Pre-Mint preparation successful! Ready for MetaMask signature.")
    );
});

/**
 * @route POST /api/v1/images/
 * @description Saves the finalized image data to MongoDB AFTER a successful blockchain transaction.
 */
const confirmAndRegisterImage = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing");
    }

    let blockTimestamp: Date;

    const {title, description, assetCategory, tags, fileDetails, imageHash, watermarkID, imageCID, metadataCID, thumbnailUrl, transactionHash, originalAssetHash} = req.body as IConfirmMintPayload

    if(!transactionHash || !imageHash || !watermarkID || !metadataCID || !thumbnailUrl || !originalAssetHash) {
        throw new ApiError(400, "Missing critical blockchain or IPFS data for final registration.");
    }

    const existingTx = await Image.findOne({transactionHash});
    if(existingTx) {
        throw new ApiError(409, "This transaction has already been recorded.");
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    let receipt: ethers.TransactionReceipt | null = null;
    
    try {
        receipt = await provider.getTransactionReceipt(transactionHash);
        

        if(!receipt) {
            throw new ApiError(404, "Transaction receipt not found on local node. try again");
        }

        const block = await provider.getBlock(receipt.blockNumber!);
        blockTimestamp = new Date(Number(block!.timestamp) * 1000);

        if(receipt.status !== 1) {
            throw new ApiError(400, "On-chain transaction failed. Cannot register.");
        }

        if (receipt.from.toLowerCase() !== customReq.user.walletAddress?.toLowerCase()) {
            throw new ApiError(401, "Fraud detected! Transaction sender mismatch.");
        }

        if (receipt.to?.toLowerCase() !== config.contractAddress.toLowerCase()) {
            throw new ApiError(400, "Transaction was sent to a different contract.");
        }

        const contractABI = ["event ImageRegistered(address indexed creator, bytes32 indexed hash, bytes4 watermarkID, string metadataCID)"];
        const iface = new ethers.Interface(contractABI);

        let isDataAuthentic = false;

    const formattedLocalWatermark = (watermarkID.startsWith("0x") ? watermarkID : `0x${watermarkID}`).toLowerCase();
    const formattedLocalHash = imageHash.toLowerCase();

    for (const log of receipt.logs) {
        try {
            const decodedLog = iface.parseLog({ topics: log.topics as string[], data: log.data });
            
            if (decodedLog && decodedLog.name === "ImageRegistered") {
                const onChainHash = decodedLog.args.hash.toLowerCase();
                const onChainWatermark = decodedLog.args.watermarkID.toLowerCase();
                
                if (onChainHash === formattedLocalHash && onChainWatermark === formattedLocalWatermark) {
                    isDataAuthentic = true;
                    break;
                }
            }
        } catch (e) {
            continue;
        }
    }

        if (!isDataAuthentic) {
            throw new ApiError(400, "Payload Manipulation Detected! The provided hash does not match the blockchain transaction.");
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Blockchain communication failed during verification.");
    }

    console.log(`Verifying and saving asset to DB. TxHash: ${transactionHash}`);

    const txFeeInEth = ethers.formatEther(
        receipt.gasUsed * (receipt.gasPrice ?? 0n)
    );

    const newImage = await Image.create({
        uploader: customReq.user.walletAddress!,
        currentOwner: customReq.user.walletAddress!,
        title,
        description,
        assetCategory,
        tags,
        fileDetails,
        imageHash,
        watermarkID,
        imageCID,
        metadataCID,
        thumbnailUrl,
        originalAssetHash,
        transactionHash,
        status: 'verified',
        history: [{ action: 'minted', actor: customReq.user.walletAddress!, timestamp: blockTimestamp, transactionHash: transactionHash }]
    });

    await Activity.create({
        eventType: 'ImageMinted',
        actor: customReq.user.walletAddress!, 
        targetUser: config.contractAddress,   
        transactionHash: transactionHash,
        gasUsed: txFeeInEth,
        blockNumber: receipt.blockNumber,
        blockTimestamp: blockTimestamp
    });

    return res.status(201).json(
        new ApiResponse(201, {
            imageId: newImage._id,
            transactionHash: newImage.transactionHash,
            exploreLink: `/asset/${newImage.imageHash}`
        }, "Asset fully registered on ProveNode Blockchain & Database.")
    )
});

/**
 * @route GET /api/v1/images/
 * @description Public API for dashboard cards. Returns ONLY essential Web2 data for fast loading.
 * Implements Pagination and ensures burned images are excluded.
 */
const getAllImages = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 24, 48); 
    const skip = (page - 1) * limit;

    const baseQuery = { status: 'verified' };

    const [totalImages, images] = await Promise.all([
        Image.countDocuments(baseQuery),
        Image.find(baseQuery)
            .select('title currentOwner assetCategory thumbnailUrl imageHash createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
    ]);

    const totalPages = Math.ceil(totalImages / limit);
    
    const paginationData = {
        totalImages,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages
    };

    if (!images || images.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { images: [], pagination: paginationData }, "No verified images found yet.")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { images, pagination: paginationData }, "Explore feed fetched successfully.")
    );
});

/**
 * @route GET /api/v1/images/:hash
 * @description Fetches detailed provenance data for a specific image by its unique hash.
 * This is a public route, but it provides ownership context if a viewerWallet is passed.
 * Supports decentralized transparency by providing direct IPFS gateway links.
 */
const getImageByHash = asyncHandler(async (req: Request, res: Response) => {
    const {hash} = req.params;

    if(!hash || hash.length == 0) {
        throw new ApiError(404, "hash not found")
    }
    const viewerWallet = req.query.viewerWallet as string;

    const image = await Image.findOne({ 
        imageHash: hash, 
        status: { $in: ['verified', 'burned'] },
    });

    if(!image) {
        throw new ApiError(404, "Asset not found or not verified yet.");
    }

    let responseData: any = {
        title: image.title,
        description: image.description,
        assetCategory: image.assetCategory,
        tags: image.tags,
        fileDetails: image.fileDetails,
        uploader: image.uploader,
        currentOwner: image.currentOwner,
        status: image.status,
        thumbnailUrl: image.thumbnailUrl,
        transactionHash: image.transactionHash,
        watermarkID: image.watermarkID,
        imageHash: image.imageHash,
        history: image.history,
        downloadUrl: `https://gateway.pinata.cloud/ipfs/${image.imageCID}`, 
        metadataLink: `https://gateway.pinata.cloud/ipfs/${image.metadataCID}`,
        isOwner: false
    }

    if (viewerWallet && viewerWallet.toLowerCase() === image.currentOwner.toLowerCase()) {
        responseData.isOwner = true;
    }

    return res.status(200).json(
        new ApiResponse(200, responseData, "Asset details fetched.")
    );
})

/**
 * @route POST /api/v1/images/:hash/metadata/draft
 * @description Generates a new JSON metadata file on IPFS (Pinata) before the on-chain transaction.
 */
const prepareMetadataUpdate = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if (!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing.");
    }

    const hash = req.params.hash as string;
    const { title, description, tags, assetCategory } = req.body as IUploadImage;
    const image = await Image.findOne({ imageHash: hash, status: 'verified' });

    if (!image) {
        throw new ApiError(404, "Asset not found or it has been burned.");
    }

    if (image.currentOwner.toLowerCase() !== customReq.user.walletAddress?.toLowerCase()) {
        throw new ApiError(403, "Fraud alert! You are not the current owner of this asset.");
    }

    const updatedTitle = title !== undefined ? title.trim() : image.title;
    const updatedDescription = description !== undefined ? description.trim() : image.description;
    const updatedCategory = assetCategory !== undefined ? assetCategory.trim() : image.assetCategory;
    
    let updatedTags = image.tags;
    if (tags !== undefined) {
        updatedTags = tags ? tags.split(',').map((tag: string) => tag.trim().toLowerCase()) : [];
    }

    const isTitleChanged = updatedTitle !== image.title;
    const isDescChanged = updatedDescription !== image.description;
    const isCategoryChanged = updatedCategory !== image.assetCategory;
    const isTagsChanged = updatedTags.join(',') !== image.tags.join(',');

    if (!isTitleChanged && !isDescChanged && !isCategoryChanged && !isTagsChanged) {
        throw new ApiError(400, "No changes detected. Please modify at least one field (Title, Description, Category, or Tags) to update the metadata.");
    }

    console.log(`Changes detected! Generating new IPFS Metadata for Hash: ${hash}`);

    const newMetadataCID = await uploadMetadataToPinata(
        updatedTitle,
        updatedDescription,
        image.imageCID,         
        updatedCategory,        
        updatedTags,            
        image.fileDetails,      
        image.watermarkID,      
        image.imageHash
    );

    if (!newMetadataCID) {
        throw new ApiError(500, "Failed to upload new JSON metadata to IPFS via Pinata.");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            newMetadataCID,
            preparedData: {
                title: updatedTitle,
                description: updatedDescription,
                assetCategory: updatedCategory,
                tags: updatedTags
            }
        }, "New IPFS metadata generated successfully! Ready for MetaMask signature.")
    );
});

/**
 * @route PATCH /api/v1/images/:hash/metadata/confirm
 * @description Syncs the updated metadata in MongoDB AFTER a successful on-chain transaction.
 */
const confirmMetadataUpdate = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if (!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing.");
    }

    let blockTimestamp: Date;
    const hash = req.params.hash as string;
    const { newMetadataCID, transactionHash } = req.body;

    if (!newMetadataCID || !transactionHash) {
        throw new ApiError(400, "Missing newMetadataCID or transactionHash for final confirmation.");
    }

    const image = await Image.findOne({ imageHash: hash, status: 'verified'});
    
    if (!image) throw new ApiError(404, "Asset not found or burned.");
    if (image.currentOwner.toLowerCase() !== customReq.user.walletAddress?.toLowerCase()) throw new ApiError(403, "Not authorized.");
    if (image.transactionHash === transactionHash) throw new ApiError(409, "Already synced.");

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    let receipt: ethers.TransactionReceipt | null = null;
    try {
        receipt = await provider.getTransactionReceipt(transactionHash);

        if (!receipt || receipt.status !== 1) throw new ApiError(400, "On-chain transaction failed.");
        if (receipt.from.toLowerCase() !== customReq.user.walletAddress?.toLowerCase()) throw new ApiError(401, "Sender mismatch.");
        if (receipt.to?.toLowerCase() !== config.contractAddress.toLowerCase()) throw new ApiError(400, "Contract mismatch.");

        const block = await provider.getBlock(receipt.blockNumber!);
        blockTimestamp = new Date(Number(block!.timestamp) * 1000);

        const contractABI = ["event MetadataUpdated(bytes32 indexed hash, string newMetadataCID)"];
        const iface = new ethers.Interface(contractABI);

        let isDataAuthentic = false;
        const formattedLocalHash = hash.toLowerCase();

        for (const log of receipt.logs) {
            try {
                const decodedLog = iface.parseLog({ topics: log.topics as string[], data: log.data });
                if (decodedLog && decodedLog.name === "MetadataUpdated") {
                    const onChainHash = decodedLog.args.hash.toLowerCase();
                    const onChainCID = decodedLog.args.newMetadataCID;
                    if (onChainHash === formattedLocalHash && onChainCID === newMetadataCID) {
                        isDataAuthentic = true;
                        break;
                    }
                }
            } catch (e) { continue; }
        }

        if (!isDataAuthentic) {
            throw new ApiError(400, "Payload Manipulation! CID does not match blockchain transaction.");
        }

    } catch (error) {
        throw new ApiError(500, "Blockchain communication failed.");
    }

    console.log(`Verified On-Chain. Fetching real JSON from IPFS CID: ${newMetadataCID}`);

    let ipfsMetadata;
    try {
        const ipfsResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${newMetadataCID}`);
        ipfsMetadata = ipfsResponse.data;
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve verified metadata from IPFS to sync DB.");
    }

    image.title = ipfsMetadata.name || image.title;
    image.description = ipfsMetadata.description || image.description;
    
    if (ipfsMetadata.attributes && Array.isArray(ipfsMetadata.attributes)) {
        const categoryAttr = ipfsMetadata.attributes.find((attr: any) => attr.trait_type === "Category");
        if (categoryAttr) {
            image.assetCategory = categoryAttr.value;
        }

        const tagAttrs = ipfsMetadata.attributes.filter((attr: any) => attr.trait_type === "Tag");
        if (tagAttrs && tagAttrs.length > 0) {
            image.tags = tagAttrs.map((attr: any) => attr.value);
        } else {
            image.tags = [];
        }
    }

    const txFeeInEth = ethers.formatEther(
        receipt.gasUsed * (receipt.gasPrice ?? 0n)
    );

    image.metadataCID = newMetadataCID;
    image.transactionHash = transactionHash; 
    image.history.push({
        action: 'metadata_updated',
        actor: customReq.user.walletAddress!,
        timestamp: blockTimestamp,
        transactionHash: transactionHash
    });

    await image.save();

    await Activity.create({
        eventType: 'MetadataUpdated',
        actor: customReq.user.walletAddress!, // User Wallet
        targetUser: config.contractAddress,   // ProveNode Smart Contract Address
        transactionHash: transactionHash,
        gasUsed: txFeeInEth,
        blockNumber: receipt.blockNumber,
        blockTimestamp: blockTimestamp
    });

    return res.status(200).json(
        new ApiResponse(200, {
            imageId: image._id,
            imageHash: image.imageHash,
            metadataCID: image.metadataCID
        }, "Asset metadata fully secured and synced with the blockchain.")
    );
});

/**
 * @route PATCH /api/v1/images/:hash/transfer
 * @description Syncs MongoDB after a successful on-chain transferImage transaction.
 */
export const confirmImageTransfer = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if (!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing.");
    }

    let blockTimestamp: Date;

    const hash = req.params.hash as string;
    const { newOwnerWallet, transactionHash } = req.body;

    if (!newOwnerWallet || !transactionHash) {
        throw new ApiError(400, "Missing newOwnerWallet or transactionHash.");
    }

    const image = await Image.findOne({ imageHash: hash, status: 'verified' });
    
    if (!image) throw new ApiError(404, "Asset not found or burned.");
    if (image.currentOwner.toLowerCase() !== customReq.user.walletAddress?.toLowerCase()) {
        throw new ApiError(403, "Not authorized. You are not the current owner.");
    }
    if (image.transactionHash === transactionHash) throw new ApiError(409, "Already synced.");

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    let receipt: ethers.TransactionReceipt | null = null;
    try {
        receipt = await provider.getTransactionReceipt(transactionHash);

        if (!receipt || receipt.status !== 1) throw new ApiError(400, "On-chain transaction failed.");
        if (receipt.from.toLowerCase() !== customReq.user.walletAddress?.toLowerCase()) throw new ApiError(401, "Sender mismatch.");
        if (receipt.to?.toLowerCase() !== config.contractAddress.toLowerCase()) throw new ApiError(400, "Contract mismatch.");

        const block = await provider.getBlock(receipt.blockNumber!);
        blockTimestamp = new Date(Number(block!.timestamp) * 1000);

        const contractABI = ["event ImageTransferred(bytes32 indexed hash, address indexed from, address indexed to)"];
        const iface = new ethers.Interface(contractABI);

        let isDataAuthentic = false;
        const formattedLocalHash = hash.toLowerCase();
        const formattedNewOwner = newOwnerWallet.toLowerCase();

        for (const log of receipt.logs) {
            try {
                const decodedLog = iface.parseLog({ topics: log.topics as string[], data: log.data });
                if (decodedLog && decodedLog.name === "ImageTransferred") {
                    const onChainHash = decodedLog.args.hash.toLowerCase();
                    const onChainTo = decodedLog.args.to.toLowerCase();
                    
                    if (onChainHash === formattedLocalHash && onChainTo === formattedNewOwner) {
                        isDataAuthentic = true;
                        break;
                    }
                }
            } catch (e) { continue; }
        }

        if (!isDataAuthentic) {
            throw new ApiError(400, "Payload Manipulation! Transaction data does not match.");
        }

    } catch (error) {
        throw new ApiError(500, "Blockchain communication failed.");
    }

    console.log(`Transfer Verified On-Chain. Updating DB for Hash: ${hash}`);

    const txFeeInEth = ethers.formatEther(
        receipt.gasUsed * (receipt.gasPrice ?? 0n)
    );
    
    image.currentOwner = newOwnerWallet.toLowerCase();
    image.transactionHash = transactionHash; 
    image.history.push({
        action: 'transferred',
        actor: customReq.user.walletAddress!,
        to: newOwnerWallet.toLowerCase(),
        timestamp: blockTimestamp,
        transactionHash: transactionHash
    });

    await image.save();

    await Activity.create({
        eventType: 'ImageTransferred',
        actor: customReq.user.walletAddress!,  
        targetUser: newOwnerWallet.toLowerCase(), 
        transactionHash: transactionHash,
        gasUsed: txFeeInEth,
        blockNumber: receipt.blockNumber,
        blockTimestamp: blockTimestamp
    });

    return res.status(200).json(
        new ApiResponse(200, {
            imageId: image._id,
            imageHash: image.imageHash,
            newOwner: image.currentOwner
        }, "Asset ownership successfully transferred and synced.")
    );
});

/**
 * @route PATCH /api/v1/images/:hash/burn
 * @description Syncs MongoDB after a successful on-chain burnImage transaction.
 */
const confirmImageBurn = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if (!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing.");
    }

    let blockTimestamp: Date

    const hash = req.params.hash as string;
    const { transactionHash } = req.body;

    if (!transactionHash) {
        throw new ApiError(400, "Missing transactionHash for final confirmation.");
    }

    const image = await Image.findOne({ imageHash: hash, status: 'verified'});
    
    if (!image) throw new ApiError(404, "Asset not found or already burned.");
    if (image.currentOwner.toLowerCase() !== customReq.user.walletAddress?.toLowerCase()) {
        throw new ApiError(403, "Not authorized. Only the owner can burn this asset.");
    }
    if (image.transactionHash === transactionHash) throw new ApiError(409, "Already synced.");

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    let receipt: ethers.TransactionReceipt | null = null;
    try {
        receipt = await provider.getTransactionReceipt(transactionHash);

        if (!receipt || receipt.status !== 1) throw new ApiError(400, "On-chain transaction failed.");
        if (receipt.from.toLowerCase() !== customReq.user.walletAddress?.toLowerCase()) throw new ApiError(401, "Sender mismatch.");
        if (receipt.to?.toLowerCase() !== config.contractAddress.toLowerCase()) throw new ApiError(400, "Contract mismatch.");

        const block = await provider.getBlock(receipt.blockNumber!);
        blockTimestamp = new Date(Number(block!.timestamp) * 1000);

        const contractABI = ["event ImageBurned(bytes32 indexed hash, address indexed owner)"];
        const iface = new ethers.Interface(contractABI);

        let isDataAuthentic = false;
        const formattedLocalHash = hash.toLowerCase();

        for (const log of receipt.logs) {
            try {
                const decodedLog = iface.parseLog({ topics: log.topics as string[], data: log.data });
                if (decodedLog && decodedLog.name === "ImageBurned") {
                    const onChainHash = decodedLog.args.hash.toLowerCase();
                    const onChainOwner = decodedLog.args.owner.toLowerCase();
                    
                    if (onChainHash === formattedLocalHash && onChainOwner === customReq.user.walletAddress?.toLowerCase()) {
                        isDataAuthentic = true;
                        break;
                    }
                }
            } catch (e) { continue; }
        }

        if (!isDataAuthentic) {
            throw new ApiError(400, "Payload Manipulation! Burn event not found or hash mismatch.");
        }

    } catch (error) {
        throw new ApiError(500, "Blockchain communication failed.");
    }

    console.log(`Burn Verified On-Chain. Updating DB for Hash: ${hash}`);

    const txFeeInEth = ethers.formatEther(
        receipt.gasUsed * (receipt.gasPrice ?? 0n)
    );

    image.status = 'burned';
    image.currentOwner = "0x0000000000000000000000000000000000000000";
    image.transactionHash = transactionHash; 
    image.history.push({
        action: 'burned',
        actor: customReq.user.walletAddress!,
        timestamp: blockTimestamp,
        transactionHash: transactionHash
    });

    await image.save();

    await Activity.create({
        eventType: 'ImageBurned',
        actor: customReq.user.walletAddress!,  // User Wallet
        targetUser: '0x0000000000000000000000000000000000000000', // Null Address
        transactionHash: transactionHash,
        gasUsed: txFeeInEth,
        blockNumber: receipt.blockNumber,
        blockTimestamp: blockTimestamp
    });

    return res.status(200).json(
        new ApiResponse(200, {
            imageId: image._id,
            imageHash: image.imageHash,
            status: image.status
        }, "Asset successfully burned and removed from circulation.")
    );
});

/**
 * @route GET /api/v1/images/search
 * @description Search for images based on title, description, category, or tags.
 */
const searchImages = asyncHandler(async (req: Request, res: Response) => {
    const {q} = req.query;

    if(!q || typeof q !== 'string' || q.trim() ==="") {
        throw new ApiError(400, "Search query (q) is required");
    }

    const searchRegex = new RegExp(q as string, 'i');

    const results = await Image.find({
        status: 'verified',
        $or: [
            { title: { $regex: searchRegex } },
            { assetCategory: { $regex: searchRegex } },
            { tags: { $regex: searchRegex } }
        ]
    })
    .select('title currentOwner assetCategory thumbnailUrl imageHash createdAt')
    .sort({ createdAt: -1 })
    .limit(12);

    return res.status(200).json(
        new ApiResponse(200, results, "Search results fetched successfully.")
    );
})

/**
 * @route POST /api/v1/images/verify
 * @description Verifies image authenticity by checking hash first, then fallback to invisible watermark.
 */
const verifyImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file || !req.file.buffer) {
        throw new ApiError(400, "Image file is required for verification");
    }

    const rawUint8Array = new Uint8Array(req.file.buffer);
    const incomingFileHash = ethers.keccak256(rawUint8Array);

    let matchedAsset = await Image.findOne({
        $or: [
            { originalAssetHash: incomingFileHash },
            { imageHash: incomingFileHash }
        ]
    }).lean();

    if (matchedAsset) {
        return res.status(200).json(
            new ApiResponse(200, {
                status: "authentic",
                asset: matchedAsset,
            }, "Exact match found. The asset is authentic.")
        );
    }

    const extractionForm = new FormData();
    extractionForm.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.buffer.length
    });

    try {
        const extractResponse = await axios.post(`${config.watermarkEngineUrl}/extract-watermark`, extractionForm, {
            headers: { 
                ...extractionForm.getHeaders(), 
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity }
        });

        if (extractResponse.data && extractResponse.data.status === "found" && extractResponse.data.watermark_id) {
            const foundCoreDNA = extractResponse.data.watermark_id; 

            if (!/^0+$/.test(foundCoreDNA)) {
                const formattedWatermarkID = foundCoreDNA.startsWith('0x') ? foundCoreDNA : `0x${foundCoreDNA}`;
                
                matchedAsset = await Image.findOne({ watermarkID: formattedWatermarkID }).lean();

                if (matchedAsset) {
                    return res.status(200).json(
                        new ApiResponse(200, {
                            status: "edited",
                            asset: matchedAsset,
                        }, "Registered asset detected, but modifications are present.")
                    );
                }
            }
        }
    } catch (error: any) {
        if (error instanceof ApiError) throw error;
        console.error("--- DEBUG PRODUCTION ERROR ---");
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("Message:", error.message);
        console.error("-----------------------------");

        throw new ApiError(500, "Verification Engine Error: Failed to extract ProveNode DNA. Please try again later.");
    }

    const mimeMap: Record<string, string> = {
        'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg',
        'image/webp': 'webp', 'image/bmp': 'bmp'
    };
    const mimeType = mimeMap[req.file.mimetype] ? req.file.mimetype : 'image/jpeg';

    return res.status(200).json(
        new ApiResponse(200, {
            status: "unregistered",
            asset: null,
            uploadedFileDetails: {
                fileSize: req.file.buffer.length,
                fileType: mimeType
            }
        }, "No match found. This asset is not registered on ProveNode.")
    );
});


export {
    uploadAndGenerateProvenance,
    confirmAndRegisterImage,
    getAllImages,
    getImageByHash,
    prepareMetadataUpdate,
    confirmMetadataUpdate,
    confirmImageBurn,
    searchImages,
    verifyImage
}




