import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import { User } from "../Models/user.models.js";
import { Image } from "../Models/image.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../Utils/cloudinary.js";
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
    location?: string;
    socialLinks?: any;
}

interface ISubmitKyc {
    governmentId: string;
}

/**
 * @route GET /api/v1/users/me
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

    const searchWallet = walletAddress.toLowerCase();

    const userProfile = await User.findOne({ walletAddress: searchWallet })
        .select("fullName walletAddress bio profileImage coverImage location socialLinks isBlockchainRegistered kycStatus createdAt");
    
    if (!userProfile) {
        throw new ApiError(404, "User not found");
    }

    // TypeScript ke strict vabe bole deya hocche je status exactly 'verified' hobe
    const imageQuery = {
        currentOwner: userProfile.walletAddress!,
        status: 'verified' 
    };

    const [totalImages, userImages] = await Promise.all([
        Image.countDocuments(imageQuery),
        Image.find(imageQuery)
            .select('title currentOwner assetCategory thumbnailUrl imageHash createdAt')
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
 * @route POST /api/v1/users/batch
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
    }).select("fullName connectedWallets profileImage isBlockchainRegistered");

    // Reduce to Key-Value pair for O(1) frontend rendering
    const usersMap = users.reduce((acc, user) => {
        if (user.walletAddress && lowerCaseWallets.includes(user.walletAddress)) {
            acc[user.walletAddress] = {
                fullName: user.fullName,
                profileImage: user.profileImage,
                isBlockchainRegistered: user.isBlockchainRegistered
            };
        }
        return acc;
    }, {} as Record<string, any>);

    return res.status(200).json(
        new ApiResponse(200, { users: usersMap }, "User profiles fetched successfully")
    );
});

/**
 * @route PATCH /api/v1/users/me
 * @description Updates user profile details securely.
 * Blocks sensitive fields (email, wallet) from being maliciously updated.
 */
const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    if (!customReq.user) {
        throw new ApiError(401, "Unauthorized request. User missing");
    }

    const userId = customReq.user._id;
    const { fullName, bio, location, socialLinks } = req.body as IUpdateProfileBody;

    const updateFields: any = {};

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

    if (location && location.trim() !== "") {
        if (location.trim().length > 50) {
            throw new ApiError(400, "Location cannot exceed 50 characters");
        }
        updateFields.location = location.trim();
    }

    if (socialLinks) {
        updateFields.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const profileImageLocalPath = files?.profileImage?.[0]?.path;
    if (profileImageLocalPath) {
        
        try {
            const uploadedImage = await uploadOnCloudinary(profileImageLocalPath);
            if (uploadedImage) {
                updateFields.profileImage = uploadedImage.url;
            } else {
                throw new ApiError(500, "Failed to upload profile image to Cloudinary");
            }
        } finally {
            try {
                await fs.unlink(profileImageLocalPath);
            } catch (error) {
                console.error("Failed to delete temp profile image:", error);
            }
        }    
    };

    const coverImageLocalPath = files?.coverImage?.[0]?.path;

    if (coverImageLocalPath) {
        try {
            const uploadedImage = await uploadOnCloudinary(coverImageLocalPath);
            if (uploadedImage) {
                updateFields.coverImage = uploadedImage.url;
            } else {
                throw new ApiError(500, "Failed to upload cover image to Cloudinary");
            }
        } finally {
            try {
                await fs.unlink(coverImageLocalPath);
            } catch (error) {
                console.error("Failed to delete temp cover image:", error);
            }
        }    
    };

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "Please provide at least one field to update");
    } 

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { returnDocument: 'after' }
    ).select("-refreshToken -nonce -googleId");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});

/**
 * @route POST /api/v1/users/me/kyc
 * @description Protected route. Uploads NID and Selfie, updates status to pending.
 */
const submitKyc = asyncHandler(async (req: CustomRequest, res: Response) => {
    const {governmentId} = req.body as ISubmitKyc;
    const userId = req.user?._id;

    if(!governmentId) {
        throw new ApiError(400, "Government ID is required");
    }

    const user = await User.findById(userId);
    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(!user.walletAddress) { 
        throw new ApiError(403, "Please link a wallet before submitting KYC");
    }
    
    if(user.kycStatus === 'pending' || user.kycStatus === 'verified') {
        throw new ApiError(400, `KYC is already ${user.kycStatus}`)
    }

    const idExists = await User.findOne({governmentId});
    if(idExists) {
        throw new ApiError(409, "This ID is already registered to another account");
    }

    const files = req.files as {[fieldname: string]: Express.Multer.File[]};
    const govIdImageLocalPath = files?.govIdImage?.[0]?.path;
    const selfieLocalPath = files?.selfieWithGovId?.[0]?.path;

    if(!govIdImageLocalPath || !selfieLocalPath) {
        throw new ApiError(400, "govIdImage and selfieWithGovId are required");
    }

    let govIdImage: any = null;
    let selfie: any = null;

    try {
        govIdImage = await uploadOnCloudinary(govIdImageLocalPath);
        if (!govIdImage){
            throw new ApiError(500, "Failed to upload Government ID image");
        } 

        selfie = await uploadOnCloudinary(selfieLocalPath);
        if (!selfie){
            throw new ApiError(500, "Failed to upload Selfie image");
        } 
    
        user.governmentId = governmentId;
        user.govIdImageUrl = govIdImage.url;
        user.selfieWithGovIdUrl = selfie.url;
        user.kycStatus = 'pending';
        user.kycSubmittedAt = new Date();
    
        await user.save({validateBeforeSave: false});
    
        return res.status(200).json(
            new ApiResponse(200, {kycStatus: user.kycStatus}, "KYC submitted successfully. Pending admin approval.")
        )
    } catch (error) {
        if(govIdImage && !selfie) {
            if (govIdImage.public_id) await deleteFromCloudinary(govIdImage.public_id);
        }
        throw error;
    } finally {
        try {
            if (govIdImageLocalPath) await fs.unlink(govIdImageLocalPath);
            if (selfieLocalPath) await fs.unlink(selfieLocalPath);
        } catch (cleanupErr) {
            console.error("Temp file cleanup failed:", cleanupErr);
        }
    }
});


export {
    getCurrentUser,
    getUserPublicProfile,
    getUsersByWallets,
    updateProfile,
    submitKyc
}