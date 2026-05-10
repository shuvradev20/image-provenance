import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import { User } from "../Models/user.models.js";
import { Image } from "../Models/image.models.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import fs from "fs/promises"


interface IWalletAddressParams {
    walletAddress?: string;
}

interface IMultipleWalletsBody {
    wallets: string[];
}

interface IUpdateProfileBody {
    fullName?: string;
    bio?: string;
}

/**
 * @route GET /api/v1/users/current-user
 * @description Retrieves the authenticated user's private dashboard profile.
 * Hides sensitive internal tokens but shows KYC and wallet status.
 */
const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if (!customReq.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const currentUser = await User.findById(customReq.user._id)
        .select("-refreshToken -nonce -googleId");

    if (!currentUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, currentUser, "Current user fetched successfully")
    );
});

/**
 * @route GET /api/v1/users/profile/:walletAddress
 * @description Fetches a user's public profile and their verified/non-burned assets.
 * Implements Pagination and strictly selects public-facing fields for privacy.
 */
const getUserPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params as IWalletAddressParams;

    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 20);
    const skip = (page - 1) * limit;

    if (!walletAddress || typeof walletAddress !== 'string') {
        throw new ApiError(400, "Wallet address is required");
    }

    const userProfile = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
        .select("fullName walletAddress bio profileImage isBlockchainRegistered createdAt");
    
    if (!userProfile) {
        throw new ApiError(404, "User not found");
    }

    const imageQuery = {
        uploader: userProfile._id,
        status: 'verified',
        isBurned: false
    };

    // Parallel execution for high-speed data retrieval
    const [totalImages, userImages] = await Promise.all([
        Image.countDocuments(imageQuery),
        Image.find(imageQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
    ]);

    const totalPages = Math.ceil(totalImages / limit);
    const hasNextPage = page < totalPages;

    return res.status(200).json(
        new ApiResponse(200, {
            profile: userProfile,
            images: userImages,
            pagination: {
                totalImages,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage
            }
        }, "Public profile and assets fetched successfully")
    );
});

/**
 * @route POST /api/v1/users/multiple-profiles
 * @description Efficiently resolves multiple wallet addresses into user profiles.
 * Optimized for feed/explore views utilizing O(1) Map structure.
 */
const getUsersByWallets = asyncHandler(async (req: Request, res: Response) => {
    const { wallets } = req.body as IMultipleWalletsBody;

    if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
        throw new ApiError(400, "Please provide an array of wallet addresses");
    }

    if (wallets.length > 20) {
        throw new ApiError(400, "You can only fetch a maximum of 20 profiles at once.");
    }

    const lowerCaseWallets = wallets.map(wallet => wallet.toLowerCase());
    
    // Fetch only what's necessary for a feed view
    const users = await User.find({
        walletAddress: { $in: lowerCaseWallets }
    }).select("fullName walletAddress profileImage isBlockchainRegistered");

    // Reduce to Key-Value pair for O(1) frontend rendering
    const usersMap = users.reduce((acc, user) => {
        acc[user.walletAddress as string] = {
            fullName: user.fullName,
            profileImage: user.profileImage,
            isBlockchainRegistered: user.isBlockchainRegistered
        };
        return acc;
    }, {} as Record<string, any>);

    return res.status(200).json(
        new ApiResponse(200, { users: usersMap }, "User profiles fetched successfully")
    );
});

/**
 * @route PATCH /api/v1/users/update-profile
 * @description Updates user profile details securely.
 * Blocks sensitive fields (email, wallet) from being maliciously updated.
 */
const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if (!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing");
    }

    const userId = customReq.user._id;
    const { fullName, bio } = req.body as IUpdateProfileBody;

    // Type-safe update object
    const updateFields: { fullName?: string; bio?: string; profileImage?: string } = {};

    if (fullName && fullName.trim() !== "") {
        if (fullName.trim().length > 20) {
            throw new ApiError(400, "Full name cannot exceed 20 characters");
        }
        updateFields.fullName = fullName.trim();
    }

    if (bio !== undefined) {
        if (bio.trim().length > 200) {
            throw new ApiError(400, "Bio cannot exceed 200 characters");
        }
        updateFields.bio = bio.trim();
    }

    if (req.file) {
        const localFilePath = req.file.path;
        try {
            const uploadedImage = await uploadOnCloudinary(localFilePath);
            if (uploadedImage) {
                updateFields.profileImage = uploadedImage.url;
            } else {
                throw new ApiError(500, "Failed to upload image to Cloudinary");
            }
        } finally {
            try {
                await fs.unlink(localFilePath);
            } catch (error) {
                console.error("Failed to delete temp profile image:", error)
            }
        }     
    };

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "Please provide at least one field (Name, Bio, or Image) to update");
    } 

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true }
    ).select("-refreshToken -nonce -googleId");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});


export {
    getCurrentUser,
    getUserPublicProfile,
    getUsersByWallets,
    updateProfile,
}