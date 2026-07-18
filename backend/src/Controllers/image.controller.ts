import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { uploadImageBufferToPinata, uploadMetadataToPinata } from "../Utils/pinata.js";
import { uploadBufferOnCloudinary } from "../Utils/cloudinary.js";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import { Image } from "../Models/image.models.js";
import { ethers } from "ethers";
import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import config from "../config/config.js";
import sharp from 'sharp';


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


function calculateBitwiseSimilarity(hex1: string, hex2: string): number {
    if (!hex1 || !hex2 || hex1.length !== hex2.length) return 0;

    const buf1 = Buffer.from(hex1, 'hex');
    const buf2 = Buffer.from(hex2, 'hex');

    let totalBits = buf1.length * 8;
    let differingBits = 0;

    for (let i = 0; i < buf1.length; i++) {
        let xor = (buf1[i] || 0) ^ (buf2[i] || 0);
        
        while (xor > 0) {
            differingBits += xor & 1;
            xor >>= 1;
        }
    }
    return ((totalBits - differingBits) / totalBits) * 100;
}


/**
 * @route POST /api/v1/images/drafts
 * @description Processes image, injects watermark, uploads to Cloudinary & IPFS, 
 * and returns the exact payload needed for the MetaMask transaction.
 */
const uploadAndGenerateProvenance = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) {
        throw new ApiError(401, "Unauthorized request. user missing.");
    }

    const {title, description, assetCategory, tags} = req.body as IUploadImage;

    if(!title || !description || !assetCategory) {
        throw new ApiError(400, "Title, description, and assetCategory are required.");
    }

    if(!req.file || !req.file.buffer) {
        throw new ApiError(400, "Image file is required and must be in memory buffer");
    }

    // Hash the uploaded file buffer once for fast DB checks
    const rawUint8Array = new Uint8Array(req.file.buffer);
    const incomingFileHash = ethers.keccak256(rawUint8Array);

    // ==========================================
    // LAYER 1: RAW PLAGIARISM CHECK
    // ==========================================
    const existedOriginalImage = await Image.findOne({originalAssetHash: incomingFileHash});
    if(existedOriginalImage) {
        throw new ApiError(409, "Plagiarism Detected: This exact original image is already registered on ProveNode.");
    }

    // ==========================================
    // LAYER 2: MINTED ASSET CHECK
    // ==========================================
    const existedMintedImage = await Image.findOne({imageHash: incomingFileHash});
    if(existedMintedImage) {
        throw new ApiError(409, "Copyright Violation: This exact minted asset is already registered on ProveNode.");
    }

    // ==========================================
    // LAYER 3: DEEP COPYRIGHT CHECK & BITWISE MATCHING
    // ==========================================
    console.log("Layer 1 & 2 passed. Analyzing image for hidden ProveNode DNA...");
    const extractionForm = new FormData();
    extractionForm.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
    });

    try {
        const extractResponse = await axios.post('http://127.0.0.1:8000/extract-watermark', extractionForm, {
            headers: { ...extractionForm.getHeaders() }
        });

        // Python jodi kono DNA khuje pay (16 characters)
        if (extractResponse.data && extractResponse.data.status === "found" && extractResponse.data.watermark_id) {
            const foundCoreDNA = extractResponse.data.watermark_id; 
            
            // Shudhu 16 char theke default 0000.. asle ignore koro
            if (foundCoreDNA !== "0000000000000000") {
                // Optimized DB fetch: Shudhu padding kora ID ar owner anbe
                const allAssets = await Image.find(
                    { watermarkID: { $exists: true } }, 
                    { watermarkID: 1, currentOwner: 1, _id: 0 }
                ).lean();
                
                let bestMatch = null;
                let highestScore = 0;

                for (const asset of allAssets) {
                    if (asset.watermarkID) {
                        // DB te 64 character ache, kintu amra shudhu prothom 16 character katbo match korar jonno
                        const dbCoreDNA = asset.watermarkID.substring(0, 16);
                        
                        // 16 char vs 16 char bitwise checking
                        const score = calculateBitwiseSimilarity(foundCoreDNA, dbCoreDNA);
                        if (score > highestScore) {
                            highestScore = score;
                            bestMatch = asset;
                        }
                    }
                }

                // Threshold 65% for heavily compressed/edited matches
                if (highestScore >= 65 && bestMatch) {
                    throw new ApiError(409, `Copyright Violation: This is an edited version of an existing asset.`);
                } else {
                    console.log(`Highest DB match was only ${highestScore.toFixed(1)}%. Image is safe.`);
                }
            }
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Python Extraction Error:", error);
        throw new ApiError(500, "Failed to analyze image for existing copyrights.");
    }

    // ==========================================
    // PROCEED WITH FRESH IMAGE PIPELINE
    // ==========================================
    console.log(`Image is 100% clean. Starting Fast-Track Provenance Pipeline for: ${title}`);

    const parsedTags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
    
    // Exactly 16 hex chars (8 Bytes) for Python AI
    const coreWatermarkID = crypto.randomBytes(8).toString('hex'); 
    console.log(`Generated Core DNA for Python: ${coreWatermarkID}`);
    
    // Pad to 64 hex chars (32 Bytes) for Solidity Smart Contract
    const watermarkID = coreWatermarkID.padEnd(64, '0');

    const embedForm = new FormData();
    embedForm.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
    });
    // Send only the 16 char version to Python
    embedForm.append('watermark_id', coreWatermarkID);

    let watermarkedImageBuffer: Buffer;
    try {
        console.log("Injecting DNA via Python Microservice...");
        const pythonResponse = await axios.post('http://127.0.0.1:8000/embed-watermark', embedForm, {
            headers: { ...embedForm.getHeaders()},
            responseType: "arraybuffer" 
        });
        watermarkedImageBuffer = pythonResponse.data;
    } catch (error) {
        console.error("Python Embed Error:", error);
        throw new ApiError(500, "Failed to inject invisible watermark via Python Engine.");
    }

    console.log("Generating Keccak256 Hash for Watermarked Image...");
    const uint8ArrayData = new Uint8Array(watermarkedImageBuffer);
    const imageHash = ethers.keccak256(uint8ArrayData);

    console.log("Uploading to Cloudinary & Pinata in PARALLEL...");

    const tempDir = path.join(process.cwd(), 'public', 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    // Asol asset ekhon PNG, tai temp file-o .png
    const tempFilePath = path.join(tempDir, `watermarked_${Date.now()}.png`);

    let imageCID, metadataCID, cloudinaryResponse, thumbnailUrl;

    // ProveNode er ultimate asset format PNG hobe
    const fileDetails = {
        fileType: 'image/png',
        fileSize: watermarkedImageBuffer.length,
        width: 0,
        height: 0
    }

    // ==========================================
    // WEB2 THUMBNAIL COMPRESSION (Cloudinary er jonno JPG)
    // ==========================================
    console.log("Creating optimized thumbnail for Cloudinary...");
    let cloudinaryBuffer = watermarkedImageBuffer;

    try {
        // Jodi chobi 2MB er boro hoy, Cloudinary er jonno resize & JPG te compress korbo
        if (watermarkedImageBuffer.length > 2 * 1024 * 1024) {
            cloudinaryBuffer = await sharp(watermarkedImageBuffer)
                .resize({ width: 800, withoutEnlargement: true }) 
                .jpeg({ quality: 80 }) // Thumbnail JPG hobe
                .toBuffer();
        }
    } catch (sharpErr) {
        console.error("Sharp resize failed, using original buffer for Cloudinary", sharpErr);
    }

    try {
        const [cloudRes, pinataImgCID] = await Promise.all([
            // Cloudinary te jacche CHOTO Thumbnail buffer ta (JPG)
            uploadBufferOnCloudinary(cloudinaryBuffer),
            
            // Pinata te jacche ASHOL pure PNG buffer ta (Lossless)
            uploadImageBufferToPinata(
                watermarkedImageBuffer, 
                `${title.replace(/\s+/g, '_')}_provenode.png`, 
                'image/png'
            ),
            fs.writeFile(tempFilePath, watermarkedImageBuffer) 
        ]);

        cloudinaryResponse = cloudRes as any;
        imageCID = pinataImgCID;

        if (!cloudinaryResponse?.secure_url) throw new ApiError(500, "Failed to generate UI thumbnail.");
        if (!imageCID) throw new ApiError(500, "Failed to upload raw image to IPFS.");

        thumbnailUrl = cloudinaryResponse.secure_url;
        fileDetails.width = cloudinaryResponse.width;
        fileDetails.height = cloudinaryResponse.height;

        console.log("Uploading JSON Metadata to Pinata...");
        metadataCID = await uploadMetadataToPinata(
            title, 
            description, 
            imageCID,
            assetCategory,
            parsedTags,
            fileDetails, 
            watermarkID, // Send the 64-char version to IPFS & Smart Contract
            imageHash 
        );

        if (!metadataCID) throw new ApiError(500, "Failed to upload JSON metadata to IPFS.");

    } finally {
        try {
            await fs.unlink(tempFilePath);
        } catch (cleanupErr) {
            console.error("Temp file cleanup failed:", cleanupErr);
        }
    }

    console.log("Pipeline Complete! Dispatching Payload to Frontend.");

    return res.status(200).json(
        new ApiResponse(200, {
            imageHash,
            watermarkID, // Frontend gets 64-char version for MetaMask signing
            metadataCID,
            thumbnailUrl,
            ipfsImageUrl: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
            preparedData: {
                title, 
                description,
                assetCategory,
                tags: parsedTags,
                fileDetails,
                originalAssetHash: incomingFileHash 
            }
        }, "Pre-Mint preparation successful! Ready for MetaMask signature.")
    )
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

    try {
        const receipt = await provider.getTransactionReceipt(transactionHash);

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

        const contractABI = ["event ImageRegistered(address indexed creator, bytes32 indexed hash, bytes32 watermarkID, string metadataCID)"];
        const iface = new ethers.Interface(contractABI);

        let isDataAuthentic = false;

    const formattedLocalWatermark = ethers.zeroPadValue("0x" + watermarkID, 32).toLowerCase();
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
        throw new ApiError(500, "Blockchain communication failed during verification.");
    }

    console.log(`Verifying and saving asset to DB. TxHash: ${transactionHash}`);

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

    try {
        const receipt = await provider.getTransactionReceipt(transactionHash);

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

    image.metadataCID = newMetadataCID;
    image.transactionHash = transactionHash; 
    image.history.push({
        action: 'metadata_updated',
        actor: customReq.user.walletAddress!,
        timestamp: blockTimestamp,
        transactionHash: transactionHash
    });

    await image.save();

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

    try {
        const receipt = await provider.getTransactionReceipt(transactionHash);

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

    image.currentOwner = newOwnerWallet.toLowerCase();
    image.transactionHash = transactionHash; 
    image.history.push({
        action: 'transferred',
        actor: customReq.user.walletAddress!,
        timestamp: blockTimestamp,
        transactionHash: transactionHash
    });

    await image.save();

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

    try {
        const receipt = await provider.getTransactionReceipt(transactionHash);

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



export {
    uploadAndGenerateProvenance,
    confirmAndRegisterImage,
    getAllImages,
    getImageByHash,
    prepareMetadataUpdate,
    confirmMetadataUpdate,
    confirmImageBurn,
    searchImages
}




