import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../Models/user.model.js"
import { Image } from "../Models/image.models.js";

// --- Interfaces for Request Data ---

/**
 * @interface IRegisterUserRequest
 * @description Standard body structure for user registration.
 */
interface IRegisterUserRequest {
    fullName: string;
    email: string;
    walletAddress: string;
}

// --- Governance & Admin Controllers ---

/**
 * @route POST /api/v1/admin/add-new
 * @description Creates a new administrator with pre-verified status.
 * Used by 'Owner' role to expand the moderation team.
 */
const addNewAdmin = asyncHandler(async (req: Request, res: Response) => {
    const {fullName, email, walletAddress } = req.body as IRegisterUserRequest

    if (!fullName || !email || !walletAddress) {
        throw new ApiError(400, "All fields(fullName, email, walletAddress) are required");
    }

    // Checking existence with normalized wallet address
    const existedUser = await User.findOne({
        $or: [{email}, {walletAddress: walletAddress.toLowerCase()}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with this email or wallet address already exists")
    }

    const createdAdmin = await User.create({
        fullName,
        email,
        role: 'admin',
        status: 'pending',
        walletAddress: walletAddress.toLowerCase()
    });

    return res.status(201).json(
        new ApiResponse(201, createdAdmin, "New Admin added successfully")
    )
})

/**
 * @route GET /api/v1/admin/pending-users
 * @description Fetches all users who have registered but are not yet KYC verified.
 */
const getPendingUsers = asyncHandler(async(req: Request, res: Response) => {
    const pendingUsers = await User.find({status: 'pending'})
        .select("-refreshToken -nonce")
        .sort({createdAt: -1})

    return res.status(200).json(
        new ApiResponse(200, pendingUsers, "Pending users fetched successfully")
    )
})

/**
 * @route GET /api/v1/admin/all-users
 * @description Retrieves a master list of all registered users in the system.
 */
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find({})
        .select("-refreshToken -nonce")
        .sort({ createdAt: -1 })
    
    return res.status(200).json(
        new ApiResponse(200, users, "All users fetched successfully")
    )
})

/**
 * @route GET /api/v1/admin/flagged-images
 * @description Retrieves images that have been reported/flagged for moderation review.
 */
const getFlaggedImages = asyncHandler(async (req: Request, res: Response) => {
    const flaggedImages = await Image.find({status: 'flagged'})
        .populate("uploader", "fullName, walletAddress email nidNumber")
        .sort({createdAt: -1})

    return res.status(200).json(
        new ApiResponse(200, flaggedImages, "flagged images fetched successfully")
    )
})

/**
 * @route PATCH /api/v1/admin/warn-user/:walletAddress
 * @description Issues a formal warning to a user. 
 * Automatically flags the user for a blockchain ban if warning count reaches 3.
 * 
 * **should warn automatically
 */
const warnUser = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    if(!walletAddress || typeof walletAddress !== 'string') {
        throw new ApiError(400, "Wallet Address is required to issue a warning")
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if(!user) {
        throw new ApiError(404, "User not found in the system");
    }

    if(user.status === 'banned') {
        throw new ApiError(400, "This user is already banned on the system. No further warnings needed")
    }

    // Warning threshold management
    if(user.warningCount >= 3) {
        return res.status(200).json(
            new ApiResponse(200, {
                walletAddress: user.walletAddress,
                warningCount: user.warningCount,
                shouldBan: true
            }, "User already has 3 warnings! Please sign the transaction to ban them immediately")
        )
    }

    user.warningCount = (user.warningCount || 0) + 1;
    const shouldBan = user.warningCount >= 3;

    await user.save({ validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200, {
            walletAddress: user.walletAddress,
            warningCount: user.warningCount,
            shouldBan: shouldBan
        }, shouldBan ? "3rd warning reached! Action required: Please trigger blockchain banned now." : `Warning issued successfully. Current warnings: ${user.warningCount}`)
    )
})


export {
    addNewAdmin,
    getPendingUsers,
    getAllUsers,
    getFlaggedImages,
    warnUser
}