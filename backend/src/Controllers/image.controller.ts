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


const uploadAndGenerateProvenance = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) {
        throw new ApiError(401, "Unauthorized request. user missing")
    }

    const { title, description } = req.body

    if(!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    const localFilePath = req.file?.path
    if(!localFilePath) {
        throw new ApiError(400, "Image file is required")
    }

    const fileBuffer = fs.readFileSync(localFilePath)
    const imageHash = ethers.keccak256(fileBuffer);

    const existedImage = await Image.findOne({ imageHash });
    if (existedImage) {
        fs.unlinkSync(localFilePath);
        throw new ApiError(409, "This exact image has already been registered in the system")
    }

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

const getAllImages = asyncHandler(async (req: Request, res: Response) => {
    const images = await Image.find({
        status: 'verified',
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

const getImageByHash = asyncHandler(async (req: Request, res: Response) => {
    const { hash } = req.params;

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

const verifyImageOnChain = asyncHandler(async (req: Request, res: Response) => {
    if(!req.file) {
        throw new ApiError(400, "Please upload an image to verify")
    }

    const fileBuffer = req.file.buffer;

    const imageHash = ethers.keccak256(fileBuffer);
    console.log(`\n Verifying hash strictly on Blockchain: ${imageHash}`)

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(PROVENANCE_ADDRESS, PROVENANCE_ABI, provider)

    try {
        const imageData = await contract.getFunction("images")(imageHash);

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
        console.error("Blockchain verification Error", error)
        throw new ApiError(500, "Error cerifying image directly from smart contract")
    }
})




export {
    uploadAndGenerateProvenance,
    getAllImages,
    getMyImages,
    getImageByHash,
    verifyImageOnChain
}