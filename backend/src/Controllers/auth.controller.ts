import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../Models/user.models.js";
import { ethers } from "ethers";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";



interface IGoogleAuth {
    email: string;
    fullName: string;
    googleId: string;
}

interface ILinkWallet {
    walletAddress: string;
    signature: string;
    timestamp: number
}

interface IWalletLogin {
    walletAddress: string;
    signature: string;
}



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

const cookieOptions = {
    httpOnly: true,
    secure: true,
}

/**
 * @route POST /api/v1/auth/sessions/google
 * @description Path A: Web2 First Flow. Handles Google Sign In/Up.
 */
const googleAuth = asyncHandler(async (req: Request, res: Response) => {
    const {email, fullName, googleId} = req.body as IGoogleAuth;

    if(!email || !fullName || !googleId) {
        throw new ApiError(400, "Email, fullName and Google ID are Required");
    }

    let user = await User.findOne({email: email.toLowerCase()});

    if(!user) {
        user = await User.create({
            email: email.toLowerCase(),
            fullName,
            googleId,
            kycStatus: 'unverified',
            isBlockchainRegistered: false,
        })
    } else {
        if (!user.googleId) {
            user.googleId = googleId;
            if (user.fullName === "Unnamed Creator") {
                user.fullName = fullName;
            }
            await user.save({ validateBeforeSave: false });
        }
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-refreshToken -nonce");

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, {user: loggedInUser, accessToken}, "Google Authentication Successful")
        );
});

/**
 * @route POST /api/v1/auth/users/me/wallet
 * @description Protected route. Links a MetaMask wallet to the currently logged-in Google user.
 */
const linkWallet = asyncHandler(async (req: CustomRequest, res: Response) => {
    const {walletAddress, signature, timestamp} = req.body as ILinkWallet;
    const userId = req.user?._id;

    if(!walletAddress || !signature || !timestamp) {
        throw new ApiError(400, "Wallet address, signature, and timestamp are required");
    }

    const user = await User.findById(userId);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const normalizedAddress = walletAddress.toLowerCase()

    if (user.walletAddress) {
        if (user.walletAddress === normalizedAddress) {
            throw new ApiError(400, "This wallet is already linked to your account");
        } else {
            throw new ApiError(400, "You already have a wallet connected. You cannot link multiple wallets.");
        }
    }

    const walletExists = await User.findOne({ walletAddress: normalizedAddress });
    if (walletExists) {
        throw new ApiError(409, "This wallet is already linked to another account");
    }

    const currentTime = Date.now();
    const timeDifference = currentTime - timestamp;

    if (timeDifference > 2 * 60 * 1000 || timeDifference < -60000) { 
        throw new ApiError(400, "Signature expired! Please sign the message again.");
    }

    try {
        const message = `Link wallet to ProveNode account: ${user.email} | Time: ${timestamp}`;
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if(recoveredAddress.toLowerCase() !== normalizedAddress) {
            throw new ApiError(401, "Invalid Signature! You don't own this wallet.");
        }

        user.walletAddress = normalizedAddress;
        user.nonce = Math.floor(Math.random() * 1000000).toString();
        await user.save({ validateBeforeSave: false})

        return res.status(200).json(
            new ApiResponse(200, { walletAddress: user.walletAddress }, "Wallet linked successfully")
        )
    } catch (error) {
        throw new ApiError(400, "Signature verification failed");
    }
});

/**
 * @route GET /api/v1/auth/wallets/:walletAddress/nonce
 * @description Path B: Web3 First Flow. Gets nonce or dynamically creates a new user.
 */
const getNonce = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    if (!walletAddress || typeof walletAddress !== 'string') {
        throw new ApiError(400, "Wallet address is required and must be a string");
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const newNonce = Math.floor(Math.random() * 1000000).toString();

    let user = await User.findOne({ walletAddress: normalizedAddress });

    if(!user) {
        user = await User.create({
            walletAddress: normalizedAddress,
            nonce: newNonce,
            kycStatus: 'unverified',
            isBlockchainRegistered: false,
        })
    } else {
        user.nonce = newNonce;
        await user.save({ validateBeforeSave: false });
    }

    return res.status(200).json(
        new ApiResponse(200, {nonce: user.nonce}, "Nonce fetched successfully")
    );
});

/**
 * @route POST /api/v1/auth/sessions/wallet
 * @description Logs in a Web3 user via MetaMask signature.
 */
const walletLogin = asyncHandler(async (req: Request, res: Response) => {
    const {walletAddress, signature} = req.body as IWalletLogin;
    
    if(!walletAddress || !signature) {
        throw new ApiError(400, "Wallet address and signature are required")
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const user = await User.findOne({ walletAddress: normalizedAddress });

    if(!user) {
        throw new ApiError(404, "User not found. Please request a nonce first to register.");
    }

    try {
        const recoveredAddress = ethers.verifyMessage(user.nonce as string, signature);
        if(recoveredAddress.toLowerCase() !== normalizedAddress) {
            throw new ApiError(401, "Invalid Signature!")
        }

        user.nonce = Math.floor(Math.random() * 1000000).toString();
        await user.save({validateBeforeSave: false});

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select("-refreshToken -nonce");

        return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, {user: loggedInUser, accessToken}, "web3 login successful!")
        )
    } catch (error) {
        throw new ApiError(400, "Invalid signature format");
    }
});



/**
 * @route POST /api/v1/auth/sessions/refresh
 * @description Rotates the refresh token and issues a new access token to maintain the session seamlessly.
 */
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request. No refresh token provided.");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            config.refreshTokenSecret
        ) as JwtPayload

        const user = await User.findById(decodedToken?._id);
        if(!user) {
            throw new ApiError(401, "Invalid refresh token. user not found")
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or has been used.");
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessTokenAndRefreshTokens(user._id);

        return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed successfully"
            )
        );
        
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token")
    }
});

/**
 * @route DELETE /api/v1/auth/session
 * @description Clears the user's session by unsetting the refresh token in the DB and clearing browser cookies.
 */
const logoutUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { 
            returnDocument: 'after' 

        }
        
    );

    return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
});



export {
    googleAuth,
    linkWallet,
    getNonce,
    walletLogin,
    refreshAccessToken,
    logoutUser
}