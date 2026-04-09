import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import { User } from "../Models/user.model.js";
import { Image } from "../Models/image.models.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";

// --- Interfaces ---

/**
 * @interface IWalletAddressParams
 * @description Defines the expected URL parameter for the public profile route.
 */
interface IWalletAddressParams {
    walletAddress?: string;
}

/**
 * @interface IMultipleWalletsBody
 * @description Defines the expected array of wallet addresses for batch user lookup.
 */
interface IMultipleWalletsBody {
    wallets: string[];
}

/**
 * @interface IUpdateProfileBody
 * @description Structure for updating user profile details. All fields are optional.
 */
interface IUpdateProfileBody {
    fullName?: string;
    bio?: string;
}

// --- User Profile Controllers ---

/**
 * @route GET /api/v1/users/current-user
 * @description Retrieves the authenticated user's private profile.
 * Used for session synchronization and fetching sensitive user data.
 */
const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    return res.status(200).json(
        new ApiResponse(200, customReq.user, "Current user fetched successfully")
    )
})

/**
 * @route GET /api/v1/users/profile/:walletAddress
 * @description Fetches a user's public profile and their verified/non-burned assets.
 * Implements privacy by selecting only public-facing fields.
 */
const getUserPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params as IWalletAddressParams;

    if(!walletAddress || typeof walletAddress !== 'string') {
        throw new ApiError(400, "Wallet address is required")
    }

    const userProfile = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
        .select("fullName walletAddress email role warningCount createdAt")
    
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

/**
 * @route POST /api/v1/users/multiple-profiles
 * @description Efficiently resolves multiple wallet addresses (from blockchain history) into user profiles.
 * Optimized for feed views where multiple uploader identities are needed at once.
 */
const getUsersByWallets = asyncHandler(async (req: Request, res: Response) => {
    const { wallets } = req.body as IMultipleWalletsBody;

    if(!wallets || !Array.isArray(wallets) || wallets.length === 0) {
        throw new ApiError(400, "Please provide an array of wallet address");
    }

    // Using $in operator with lowercase array for safe and high-performance batch lookup
    const lowerCaseWallets = wallets.map(wallet => wallet.toLowerCase());
    
    const users = await User.find({
        walletAddress: { $in: lowerCaseWallets }
    }).select("fullName walletAddress role")

    // Reduces array to a Map (Key-Value pair) for O(1) lookup speed on the frontend
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

/**
 * @route PATCH /api/v1/users/update-profile
 * @description Updates user profile details (Name, Bio, Image).
 * Handles Cloudinary uploads for new profile pictures and atomic DB updates.
 */
const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if(!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing");
    }

    const userId = customReq.user._id;

    const { fullName, bio } = req.body as IUpdateProfileBody;

    const updateFields: { fullName?: string; bio?: string; profileImage?: string } = {};

    if(fullName && fullName.trim() !== "") {
        updateFields.fullName = fullName.trim();
    }

    if(bio !== undefined) {
        updateFields.bio = bio.trim()
    }

    // Check if a file was passed via Multer middleware
    if(req.file) {
        const localFilePath = req.file.path;
        const uploadedImage = await uploadOnCloudinary(localFilePath)

        if(uploadedImage) {
            updateFields.profileImage = uploadedImage.url
        }
    }

    // Prevent unnecessary DB hits if no changes are provided
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