import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { User } from "../Models/user.model.js";
import { ethers } from "ethers";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";

/**
 * @interface IRegisterUser
 * @description Defines the expected payload structure for new user registration..
 */
interface IRegisterUser {
    fullName: string;
    email: string;
    walletAddress: string;
    nidNumber: string;
}

/**
 * @interface IVerifySignature
 * @description Defines the expected payload structure for the Web3 login process.
 * Ensures both the wallet address and the cryptographic signature are provided by the client.
 */
interface IVerifySignature {
    walletAddress: string;
    signature: string;
}

/**
 * @interface IRefreshToken
 * @description Structure for the refresh token request body. 
 * The token is marked as optional (?) because it is primarily extracted from secure HTTP-only cookies.
 */
interface IRefreshToken {
    refreshToken?: string;
}

// --- Internal Auth Utilities ---

/**
 * @function generateAccessTokenAndRefreshTokens
 * @description Generates both access and refresh tokens for a user and persists the refresh token.
 * We use a separate function for this to maintain the 'Don't Repeat Yourself' (DRY) principle,
 * as this logic is needed in both login and token refresh flows.
 */
const generateAccessTokenAndRefreshTokens = async (userId: any) => {
    try {
        const user = await User.findById(userId);

        if(!user) {
            throw new ApiError(404, "User not found while generating tokens")
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        // validateBeforeSave: false is used because we only want to update the token field
        // without re-triggering other field validations (like NID/Selfie requirements).
        await user.save({ validateBeforeSave: false})

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

// --- User Registration & Identity ---

/**
 * @route POST /api/v1/auth/register
 * @description Registers a new user with identity verification.
 * We store images on Cloudinary and the resulting URLs in MongoDB.
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const {fullName, email, walletAddress, nidNumber} = req.body as IRegisterUser;

    if(!fullName || !email || !walletAddress || !nidNumber) {
        throw new ApiError(400, "All fields (fullName, email, walletAddress, nidNumber) are required")
    }

    // Check for existing users to maintain data integrity
    const existedUser = await User.findOne({
        $or: [{email},{nidNumber}, {walletAddress: walletAddress.toLowerCase()}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with this email or wallet address or nidNumber already exists");
    }

    // const files = req.files
    const files = req.files as {[fieldname: string]: Express.Multer.File[]}

    const nidImageLocalPath = files?.nidImage?.[0]?.path;
    const selfieLocalPath = files?.selfieWithNid?.[0]?.path;

    if(!nidImageLocalPath || !selfieLocalPath) {
        throw new ApiError(400, "Nid and selfie images are required")
    }

    const nidImage = await uploadOnCloudinary(nidImageLocalPath)
    const selfie = await uploadOnCloudinary(selfieLocalPath)

    if (!nidImage || !selfie) {
        throw new ApiError(500, "Failed to upload images to cloudinary")
    }

    const createdUser = await User.create({
        fullName,
        email,
        nidNumber,
        walletAddress: walletAddress.toLowerCase(),
        nidImageUrl: nidImage.url,
        selfieWithNidUrl: selfie.url
    })

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})

// --- Web3 Authentication ---

/**
 * @route GET /api/v1/auth/nonce/:walletAddress
 * @description Fetches a user's unique nonce for Web3 signature verification.
 * Nonce is essential to prevent replay attacks during the login process.
 */
const getNonce = asyncHandler(async (req: Request, res: Response) => {
    const {walletAddress} = req.params;

    if(!walletAddress|| typeof walletAddress !== 'string') {
        throw new ApiError(400, "Wallet address is required");
    }

    const user = await User.findOne({walletAddress: walletAddress.toLowerCase()})

    if (!user) {
        throw new ApiError(404, "User not found. Please register first")
    }

    return res.status(200).json(
        new ApiResponse(200, {nonce: user.nonce}, "Nonce fetched successfully")
    )
})

/**
 * @route POST /api/v1/auth/verify-signature
 * @description Cryptographically verifies the wallet signature against the stored nonce.
 * If valid, it initiates a session by issuing JWT access and refresh tokens.
 */
const verifySignature = asyncHandler(async (req: Request, res: Response) => {
    const {walletAddress, signature} = req.body as IVerifySignature ;

    if (!walletAddress || !signature) {
        throw new ApiError(400, "Wallet address and signature are required")
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })

    if(!user) {
        throw new ApiError(404, "User not found")
    } 

    if (user.status === 'pending') {
        throw new ApiError(403, "Your account is currently pending. Please complete the blockchain registration or wait for approval.");
    }

    if (user.status === 'banned') {
        throw new ApiError(403, "Access denied. Your account has been banned from this platform.");
    }

    try {
        // Recover the address from the signature using the user's nonce as the message
        const recoveredAddress = ethers.verifyMessage(user.nonce, signature)

        if(recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()){
            throw new ApiError(401, "Invalid SIgnature! Hacker detected!")
        }

        // IMPORTANT: Change nonce after every successful login to prevent replay attacks
        user.nonce = Math.floor(Math.random() * 1000000).toString()
        await user.save({ validateBeforeSave: false});

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id);

        const options = {
            httpOnly: true, // Prevents XSS by making cookies inaccessible to client-side JS
            secure: true // Ensures cookies are only sent over HTTPS
        }

        const loggedInUser = await User.findById(user._id).select("-refreshToken -nonce")

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                }, "Web3 login successful!")
        )
    } catch (error) {
        throw new ApiError(400, "Invalid signature format")
    }
})

// --- Session Management ---

/**
 * @route POST /api/v1/auth/logout
 * @description Clears the user's session by unsetting the refresh token in the DB and clearing cookies.
 */
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;

    await User.findByIdAndUpdate(
        customReq.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})

/**
 * @route POST /api/v1/auth/refresh-token
 * @description Rotates the refresh token and issues a new access token to maintain the session.
 */
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies as IRefreshToken;
    const body = req.body as IRefreshToken;

    const incomingRefreshToken = cookies.refreshToken || body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, config.refreshTokenSecret
        ) as JwtPayload

        const user = await User.findById(decodedToken?._id)

        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false })

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})


export {
    registerUser,
    getNonce,
    verifySignature,
    logoutUser,
    refreshAccessToken
}