import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import { User } from "../Models/user.model.js";
import { Image } from "../Models/image.models.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";


const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    return res.status(200).json(
        new ApiResponse(200, customReq.user, "Current user fetched successfully")
    )
})

const getUserPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    if(!walletAddress) {
        throw new ApiError(400, "Wallet address is required")
    }

    const userProfile = await User.findOne({ walletAddress })
        .select("fullName walletAddress role isKycverified warningCount createdAt")
    
    if(!userProfile) {
        throw new ApiError(404, "User not found")
    }

    const userImages = await Image.find({
        uploader: userProfile._id,
        status: 'verified',
        isBurned: false
    }).sort({ createdAt: -1})

    return res.status(200).json(
        new ApiResponse(200, {
            profile: userProfile,
            totalImages: userImages.length,
            images: userImages
        }, "Public profile fetched successfully")
    )
})

const getUsersByWallets = asyncHandler(async (req: Request, res: Response) => {
    const { wallets } = req.body;

    if(!wallets || !Array.isArray(wallets) || wallets.length === 0) {
        throw new ApiError(400, "Please provide an array of wallet address");
    }

    const users = await User.find({
        walletAddress: { $in: wallets }
    }).select("fullName walletAddress role")

    const usersMap = users.reduce((acc, user) => {
        acc[user.walletAddress] = {
            fullName: user.fullName,
            role: user.role
        }
        return acc
    }, {} as Record<string, any>)

    return res.status(200).json(
        new ApiResponse(200, { users: usersMap }, "User profiles fetched successfully")
    )
})

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing");
    }

    const userId = customReq.user._id;

    const { fullName, bio } = req.body;

    const updateFields: any = {};

    if(fullName && fullName.trim() !== "") {
        updateFields.fullName = fullName.trim();
    }

    if(bio !== undefined) {
        updateFields.bio = bio.trim()
    }

    if(req.file) {
        const localFilePath = req.file.path;
        const uploadedImage = await uploadOnCloudinary(localFilePath)

        if(uploadedImage) {
            updateFields.profileImage = uploadedImage.url
        }
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "Please provide at least one field (Name, Bio, or Image) to update")
    } 

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: updateFields
        },
        {
            returnDocument: 'after' 
        }
    ).select("-__v -createdAt -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    )

})





export {
    getCurrentUser,
    getUserPublicProfile,
    getUsersByWallets,
    updateProfile
} 