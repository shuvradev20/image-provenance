import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Admin, type IAdmin } from "../Models/admin.models.js";
import { User } from "../Models/user.models.js";
import config from "../config/config.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ethers } from "ethers";
import { deleteFromCloudinary } from "../Utils/cloudinary.js";


interface IAdminLogin {
    email: string;
    password: string;
}

interface ICreateAdmin {
    fullName: string;
    email: string;
    password: string
}

interface AdminRequest extends Request {
    admin?: IAdmin;
}

interface IKycAction {
    userId: string;
    reason?: string;
}

const cookieOptions = {
    httpOnly: true,
    secure: true,
}

const contractAddress = config.contractAddress;
const rpcUrl = config.rpcUrl;
const ownerPrivateKey = config.ownerPrivateKey;

const contractABI = [
    "function registerUser(address _user) external"
]

const generateAccessAndRefreshTokens = async(adminId: any) => {
    try {
        const admin = await Admin.findById(adminId)
        if(!admin) throw new ApiError(404, "Admin not found while generating tokens");

        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({validateBeforeSave: false});

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating admin tokens")
    }
}

/**
 * @route POST /api/v1/admin/login
 * @description Authenticates an admin using email and password.
 */
const adminLogin = asyncHandler(async (req: Request, res: Response) => {
    const {email, password} = req.body as IAdminLogin;

    if(!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const admin = await Admin.findOne({email: email.toLowerCase()});

    if(!admin) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await admin.comparePassword(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

    return res.status(200)
    .cookie("adminAccessToken", accessToken, cookieOptions)
    .cookie("adminRefreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(200, {admin: loggedInAdmin, accessToken }, "Admin login successful")
    )
})

/**
 * @route POST /api/v1/admin/create
 * @description Creates a new sub-admin. MUST be protected by isSuperAdmin middleware.
 */
const createAdmin = asyncHandler(async (req: AdminRequest, res: Response) => {
    const { fullName, email, password } = req.body as ICreateAdmin;

    if(!fullName || !email || !password) {
        throw new ApiError(400, "Full name, email, and password are required");
    }

    const existedAdmin = await Admin.findOne({email: email.toLowerCase()});

    if(existedAdmin) {
        throw new ApiError(409, "An admin with this email already exists");
    }

    const newAdmin = await Admin.create({
        fullName,
        email: email.toLowerCase(),
        password,
        role: 'admin'
    });

    const createdAdmin = await Admin.findById(newAdmin._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdAdmin, "new admin created successfully")
    );
});

/**
 * @route POST /api/v1/admin/refresh-token
 * @description Rotates the refresh token for admins.
 */
const refreshAdminToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.adminRefreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request. No refreshToken provided")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            config.adminRefreshTokenSecret
        ) as JwtPayload

        const admin = await Admin.findById(decodedToken?._id);

        if(!admin) {
            throw new ApiError(401, "Invalid refresh token. Admin not found")
        }

        if(incomingRefreshToken !== admin?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or has been used.")
        }

        const { accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(admin._id)

        return res.status(200)
        .cookie("adminAccessToken", accessToken, cookieOptions)
        .cookie("adminRefreshToken", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Admin access token refreshed successfully"
            )
        );
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token")
    }
});

/**
 * @route POST /api/v1/admin/logout
 * @description Logs out the admin by clearing cookies and DB token.
 */
const adminLogout = asyncHandler(async (req: AdminRequest, res: Response) => {
    await Admin.findByIdAndUpdate(
        req.admin?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    return res.status(200)
        .clearCookie("adminAccessToken", cookieOptions)
        .clearCookie("adminRefreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {}, "Admin logged out successfully")
        );
});

/**
 * @route GET /api/v1/admin/users
 * @description Retrieves a master list of all registered users in the system.
 */
const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find({kycStatus: 'verified'})
        .select("-refreshToken -nonce")
        .sort({createdAt: -1})
    
    return res.status(200).json(
        new ApiResponse(200, users, "Verified users fetched successfully")
    );
});

/**
 * @route GET /api/v1/admin/pending-kyc
 * @description Fetches all users who have submitted KYC and are waiting for approval.
 */
const getPendingKycUsers = asyncHandler(async (req: Request, res: Response) => {
    const pendingUsers = await User.find({kycStatus: 'pending'})
        .select("fullName email walletAddress nidNumber nidImageUrl selfieWithNidUrl createdAt")
        .sort({createdAt: 1});
    
    return res.status(200).json(
        new ApiResponse(200, pendingUsers, "Pending KYC requests fetched successfully")
    );
});

/**
 * @route POST /api/v1/admin/approve-kyc
 * @description Admin approves KYC. The backend relayer sends a transaction to the Smart Contract.
 */
const approveKyc = asyncHandler(async (req: Request, res: Response) => {
    const {userId} = req.body as IKycAction;

    if(!userId) {
        throw new ApiError(400, "User ID is required")
    }

    const user = await User.findById(userId);

    if(!user || user.kycStatus !== 'pending') {
        throw new ApiError(400, "Invalid user or KYC is not in pending state");
    }

    if(!user.walletAddress) {
        throw new ApiError(400, "User has no wallet address linked");
    }

  
    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, ownerWallet);

        const tx = await (contract as any).registerUser(user.walletAddress);
        await tx.wait();

        user.kycStatus = 'verified';
        user.isBlockchainRegistered = true;
        await user.save({validateBeforeSave: false});

        return res.status(200).json(
            new ApiResponse(200, {
                kycStatus: user.kycStatus,
                transactionHash: tx.hash
            }, "KYC approved and User registered on Blockchain")
        );

    } catch (error) {
        console.error("Blockchain Error:", error);
        throw new ApiError(500, "Failed to register user on blockchain. Check owner wallet balance or network status.")
    }
});

/**
 * @route POST /api/v1/admin/reject-kyc
 * @description Admin rejects KYC. Deletes images from Cloudinary & clears DB fields.
 */
const rejectKyc = asyncHandler(async (req: Request, res: Response) => {
    const {userId, reason} = req.body as IKycAction;

    if(!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findById(userId);

    if(!user || user.kycStatus !== 'pending') {
        throw new ApiError(400, "Invalid user or KYC is not in pending state")
    }

    const extractPublicId = (url: string) => {
        try {
            return url.split('/').pop()?.split('.')[0];
        } catch (error) {
            return null;
        }
    };

    try {
        if (user.nidImageUrl) {
            const publicId = extractPublicId(user.nidImageUrl);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        }

        if (user.selfieWithNidUrl) {
            const publicId = extractPublicId(user.selfieWithNidUrl);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        }
    } catch (error) {
        console.error("Cloudinary Cleanup Error:", error);
    }

    user.kycStatus = 'unverified';
    user.nidNumber = undefined;
    user.nidImageUrl = undefined;
    user.selfieWithNidUrl = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {kycStatus: user.kycStatus},
            `KYC rejected. Reason: ${reason || "Invalid documentation"}. User images cleared and storage freed.`
        )
    )
});



export {
    adminLogin,
    createAdmin,
    refreshAdminToken,
    adminLogout,
    getUsers,
    getPendingKycUsers,
    approveKyc,
    rejectKyc


}