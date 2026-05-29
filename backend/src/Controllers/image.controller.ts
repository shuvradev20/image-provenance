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
 * @route POST /api/v1/images/register-pre-mint
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

    const rawUint8Array = new Uint8Array(req.file.buffer);
    const originalAssetHash = ethers.keccak256(rawUint8Array);

    const existedOriginalImage = await Image.findOne({originalAssetHash: originalAssetHash});

    if(existedOriginalImage) {
        throw new ApiError(409, "Plagiarism Detected: This exact original image already registered on ProveNode.");
    }

    console.log(`Starting Fast-Track Provenance Pipeline for: ${title}`);

    const parsedTags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
    const fileDetails = {
        fileType: req.file.mimetype,
        fileSize: req.file.size, 
        width: 0,
        height: 0
    }

    const watermarkID = crypto.randomBytes(16).toString('hex')
    console.log(`Generated DNA: ${watermarkID}`);

    const form = new FormData();
    form.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
    });
    form.append('watermark_id', watermarkID);

    let watermarkedImageBuffer: Buffer;
    try {
        console.log("Injecting DNA via Python Microservice...");
        const pythonResponse = await axios.post('http://127.0.0.1:8000/embed-watermark', form, {
            headers: { ...form.getHeaders()},
            responseType: "arraybuffer"
        });
        watermarkedImageBuffer = pythonResponse.data;
    } catch (error) {
        console.error("Python Error:", error);
        throw new ApiError(500, "Failed to inject invisible watermark via Python Engine.");
    }

    console.log("Generating Keccak256 Hash...");
    const uint8ArrayData = new Uint8Array(watermarkedImageBuffer);
    const imageHash = ethers.keccak256(uint8ArrayData);

    const existedImage = await Image.findOne({imageHash});
    if (existedImage) {
        throw new ApiError(409, "This exact modified asset is already registered in the system.");
    }

    console.log("Uploading to Cloudinary (Web2) & Pinata (Web3) in PARALLEL...");

    // 1. Dir setup agei kore nicchi
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, `watermarked_${Date.now()}.png`);

    let imageCID, metadataCID, cloudinaryResponse, thumbnailUrl;

    try {
        // 2. Promise.all diye 3 ta independent kaj eksathe run koracchi
        const [cloudRes, pinataImgCID] = await Promise.all([
            uploadBufferOnCloudinary(watermarkedImageBuffer),
            uploadImageBufferToPinata(
                watermarkedImageBuffer, 
                req.file.originalname, 
                req.file.mimetype
            ),
            fs.writeFile(tempFilePath, watermarkedImageBuffer) // Temp file o parallel e save hocche
        ]);

        // Values assign kora
        cloudinaryResponse = cloudRes as any;
        imageCID = pinataImgCID;

        // 3. Independent validation gulo ekhane korchi
        if (!cloudinaryResponse?.secure_url) {
            throw new ApiError(500, "Failed to generate UI thumbnail via Cloudinary.");
        }
        if (!imageCID){
            throw new ApiError(500, "Failed to upload raw image to IPFS.");
        }

        // File details update
        thumbnailUrl = cloudinaryResponse.secure_url;
        fileDetails.width = cloudinaryResponse.width;
        fileDetails.height = cloudinaryResponse.height;

        // 4. Ebar Metadata upload (Eta must sequential karon imageCID ar fileDetails lagbe)
        console.log("Uploading JSON Metadata to Pinata...");
        metadataCID = await uploadMetadataToPinata(
            title, 
            description, 
            imageCID,
            assetCategory,
            parsedTags,
            fileDetails, 
            watermarkID,
            imageHash
        );

        if (!metadataCID) {
            throw new ApiError(500, "Failed to upload JSON metadata to IPFS.");
        }

    } finally {
        // 5. Cleanup block same thakbe
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
            watermarkID, 
            metadataCID,
            thumbnailUrl,
            ipfsImageUrl: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
            preparedData: {
                title, 
                description,
                assetCategory,
                tags: parsedTags,
                fileDetails,
                originalAssetHash
            }
        }, "Pre-Mint preparation successful! Ready for MetaMask signature.")
    )
});

/**
 * @route POST /api/v1/images/confirm-mint
 * @description Saves the finalized image data to MongoDB AFTER a successful blockchain transaction.
 */
const confirmAndRegisterImage = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing");
    }

    const {title, description, assetCategory, tags, fileDetails, imageHash, watermarkID, imageCID, metadataCID, thumbnailUrl, transactionHash, originalAssetHash} = req.body as IConfirmMintPayload

    if(!transactionHash || !imageHash || !watermarkID || !metadataCID || !thumbnailUrl) {
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
        uploader: customReq.user._id,
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
        status: 'verified'
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
 * @route GET /api/v1/images/explore
 * @description Public API for dashboard cards. Returns ONLY essential Web2 data for fast loading.
 * Implements Pagination and ensures burned images are excluded.
 */
const getAllImages = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 24, 48); 
    const skip = (page - 1) * limit;

    const baseQuery = { status: 'verified', isBurned: false };

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
 * @route GET /api/v1/images/my-assets
 * @description Returns ONLY essential card data for the user's dashboard.
 */
const getMyImages = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if (!customReq.user) {
        throw new ApiError(401, "Unauthorized request.");
    }

    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 12, 24); 
    const skip = (page - 1) * limit;

    const myWallet = customReq.user.walletAddress!;

    const baseQuery = { currentOwner: myWallet, status: 'verified' };

    const [totalImages, myImages] = await Promise.all([
        Image.countDocuments(baseQuery),
        Image.find(baseQuery)
            .select('title currentOwner assetCategory thumbnailUrl imageHash isBurned createdAt')
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

    // 5. Response Handling
    if (!myImages || myImages.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { images: [], pagination: paginationData }, "No verified images found yet.")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, {
            images: myImages,
            pagination: paginationData
        }, "Your assets fetched successfully.")
    );
});

/**
 * @route GET /api/v1/images/details/:hash
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

    const image = await Image.findOne({imageHash: hash, status: 'verified'});

    if(!image) {
        throw new ApiError(404, "Asset not found or not verified yet.");
    }

    let responseData: any = {
        title: image.title,
        description: image.description,
        assetCategory: image.assetCategory,
        tags: image.tags,
        fileDetails: image.fileDetails,
        currentOwner: image.currentOwner,
        thumbnailUrl: image.thumbnailUrl,
        transactionHash: image.transactionHash,
        watermarkID: image.watermarkID,
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



export {
    uploadAndGenerateProvenance,
    confirmAndRegisterImage,
    getAllImages,
    getMyImages,
    getImageByHash
}




