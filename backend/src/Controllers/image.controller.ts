import { type Request, type Response } from "express"
import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/ApiError.js"
import { ApiResponse } from "../Utils/ApiResponse.js"
import { uploadImageToPinata, uploadMetadataToPinata } from "../Utils/pinata.js"
import { type CustomRequest } from "../Middlewares/auth.middleware.js"
import { Image } from "../Models/image.models.js"
import fs from 'fs'
import { ethers } from "ethers"
import { PROVENANCE_ABI, PROVENANCE_ADDRESS, RPC_URL } from "../config/contract.js"

// --- Interfaces ---

/**
 * @interface IUploadImage
 * @description Structure for the text data (title, description) coming from the frontend form.
 */
interface IUploadImage {
    title: string;
    description: string;
}

/**
 * @interface IImageHashParams
 * @description Defines the expected URL parameter when fetching details of a specific image.
 */
interface IImageHashParams {
    hash?: string;
}

// --- Image Provenance Logic ---

/**
 * @route POST /api/v1/images/register
 * @description Generates cryptographic hash, uploads assets to IPFS, and prepares data for on-chain registration.
 * This is the 'Pre-mint' phase where metadata is secured off-chain.
 */
const uploadAndGenerateProvenance = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) {
        throw new ApiError(401, "Unauthorized request. user missing")
    }

    const { title, description } = req.body as IUploadImage

    if(!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    const localFilePath = req.file?.path
    if(!localFilePath) {
        throw new ApiError(400, "Image file is required")
    }

    // Generate unique cryptographic hash for the image to ensure integrity
    const fileBuffer = fs.readFileSync(localFilePath)
    const imageHash = ethers.keccak256(fileBuffer);

    // Check if this image already exists in our record
    const existedImage = await Image.findOne({ imageHash });
    if (existedImage) {
        fs.unlinkSync(localFilePath);
        throw new ApiError(409, "This exact image has already been registered in the system")
    }

    // Upload image and metadata to IPFS via Pinata
    const imageCID = await uploadImageToPinata(localFilePath);
    if(!imageCID) {
        throw new ApiError(500, "Failed to upload image to IPFS network");
    }

    const metadataCID = await uploadMetadataToPinata(title, description, imageCID);
    if(!metadataCID) {
        throw new ApiError(500, "failed to upload metadata to IPFS network");
    }

    const savedImage = await Image.create({
        title,
        description,
        imageHash,
        imageCID,
        metadataCID,
        uploader: customReq.user._id,
        currentOwner: customReq.user.walletAddress,
        walletAddress: customReq.user.walletAddress
    })

    return res.status(201).json(
        new ApiResponse(201, {
            dbId: savedImage._id,
            imageHash,
            metadataCID,
            imageCID,
            ipfsImageUrl: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
            ipfsMetadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataCID}`
        }, "Provenance data generated successfully. Ready for Metamask transaction")
    )
})

// --- Data Retrieval ---

/**
 * @route GET /api/v1/images/all-images
 * @description Fetches all verified and active images with uploader details.
 */
const getAllImages = asyncHandler(async (req: Request, res: Response) => {
    const images = await Image.find({
        status: { $in: ['verified', 'flagged'] },
        isBurned: false
    })
    .sort({createdAt: -1})
    .populate("uploader", "fullName walletAddress")

    if(!images || images.length === 0) {
        throw new ApiError(404, "No verified images found in the system")
    }

    return res.status(200).json(
        new ApiResponse(200, images, "All verified images fetched successfully")
    )
})

/**
 * @route GET /api/v1/images/my-images
 * @description Retrieves images uploaded by the authenticated user.
 */
const getMyImages = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing")
    }

    const myImages = await Image.find(
        { 
            uploader: customReq.user._id
        })
        .sort({
            createdAt: -1
        }
    )

    return res.status(200).json(
        new ApiResponse(200, myImages, "your images fetched successfully")
    )
})


// ei controller ta kon context a use korbo mathay nai kno j banaichilm
/**
 * @route GET /api/v1/images/details/:hash
 * @description Retrieves detailed information for a specific image by its unique hash.
 */
const getImageByHash = asyncHandler(async (req: Request, res: Response) => {
    const { hash } = req.params as IImageHashParams;

    if (!hash) {
        throw new ApiError(400, "Image hash is required in the URL parameters");
    }

    const image = await Image.findOne({ imageHash: hash })
        .populate("uploader", "fullName walletAddress");

    if(!image) {
        throw new ApiError(404, "Image not found in the database")
    }

    return res.status(200).json(
        new ApiResponse(200, image, "Image details fetched successfully")
    )
})

// --- On-Chain Verification Logic ---

/**
 * @route POST /api/v1/images/verify
 * @description Directly queries the Smart Contract to verify image provenance independently of the DB.
 * This is the ultimate proof of authenticity in a decentralized system.
 */
const verifyImageOnChain = asyncHandler(async (req: Request, res: Response) => {
    if(!req.file) {
        throw new ApiError(400, "Please upload an image to verify")
    }

    try {
        const fileBuffer = fs.readFileSync(req.file.path)
        const uint8ArrayData = new Uint8Array(fileBuffer);
        const imageHash = ethers.keccak256(uint8ArrayData);

        console.log(`\n Verifying hash strictly on Blockchain: ${imageHash}`)

        console.log("RPC URL:", RPC_URL);
        console.log("Contract Address:", PROVENANCE_ADDRESS);

        // Initializing Ethers provider and contract instance for read-only query
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(PROVENANCE_ADDRESS, PROVENANCE_ABI, provider)

        const imageData = await contract.getFunction("images")(imageHash);

        fs.unlinkSync(req.file.path);

        // If the owner is a Zero Address, the image was never registered on-chain
        if(imageData.owner === ethers.ZeroAddress) {
            return res.status(404).json(
                new ApiResponse(404, { verified: false, hash: imageHash }, "Fake or Unregistered image!")
            )
        }

        return res.status(200).json(
            new ApiResponse(200, {
                verified: true,
                hash: imageHash,
                owner: imageData.owner,
                metadataCID: imageData.metadataCID,
                isTampered: imageData.isTampered,
                isBurned: imageData.isBurned,
                timestamp: imageData.timestamp?.toString()
            }, "SUCCESS: Image data fetched from blockchain")
        )
    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error("Blockchain verification Error", error)
        throw new ApiError(500, "Error verifying image directly from smart contract")
    }
})




export {
    uploadAndGenerateProvenance,
    getAllImages,
    getMyImages,
    getImageByHash,
    verifyImageOnChain
}