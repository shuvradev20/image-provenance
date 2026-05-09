import { type Request, type Response } from "express";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { User } from "../Models/user.models.js";
import { ethers } from "ethers";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";


//---Token GeneratorHelper---

interface IGoogleAuth {
    email: string;
    fullName: string;
    googleId: string;
}

interface ILinkWallet {
    walletAddress: string;
    signature: string;
}

interface IWalletLogin {
    walletAddress: string;
    signature: string;
}

interface ISubmitKyc {
    nidNumber: string;
    // Note: multer er file gulo req.files e ashe, req.body te na. 
    // Tai interface e sudhu nidNumber thakbe.
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

const cookieOptions = {
    httpOnly: true,
    secure: true,
}

//---Google Auth---

/**
 * @route POST /api/v1/auth/google
 * @description Handles both Sign Up and Sign In via Google.
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
            isBlockchainRegistered: false
        })
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
 * @route POST /api/v1/auth/link-wallet
 * @description Protected route. Links a MetaMask wallet to the currently logged-in Google user.
 */
const linkWallet = asyncHandler(async (req: CustomRequest, res: Response) => {
    const {walletAddress, signature} = req.body as ILinkWallet;
    const userId = req.user?._id;

    if(!walletAddress || !signature) {
        throw new ApiError(400, "Wallet address and signature are required");
    }

    const user = await User.findById(userId);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(user.walletAddress) {
        throw new ApiError(400, "A wallet is already linked to this account")
    }

    const walletExists = await User.findOne({ walletAddress: walletAddress.toLowerCase()});
    if(walletExists) {
        throw new ApiError(409, "This wallet is already linked to another account");
    }

    try {
        const message = `Link wallet to ProveNode account: ${user.email}`;
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if(recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            throw new ApiError(401, "Invalid Signature! You don't own this wallet.");
        }

        user.walletAddress = walletAddress.toLowerCase();
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
 * @route GET /api/v1/auth/nonce/:walletAddress
 * @description Gets nonce for wallet login. Fails if wallet is not registered.
 */
const getNonce = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    if (!walletAddress || typeof walletAddress !== 'string') {
        throw new ApiError(400, "Wallet address is required and must be a string");
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase()});
    if(!user) {
        throw new ApiError(404, "No account found with this wallet. Please 'continue with Google' to sign in")
    }

    return res.status(200).json(
        new ApiResponse(200, {nonce: user.nonce}, "Nonce fetched successfully")
    );
});

/**
 * @route POST /api/v1/auth/wallet-login
 * @description Logs in a returning user via MetaMask signature.
 */
const walletLogin = asyncHandler(async (req: Request, res: Response) => {
    const {walletAddress, signature} = req.body as IWalletLogin;
    
    if(!walletAddress || !signature) {
        throw new ApiError(400, "Wallet address and signature are required")
    }

    const user = await User.findOne({walletAddress: walletAddress.toLowerCase()});
    if(!user) {
        throw new ApiError(404, "User not found. Please log in with Google.");
    }

    try {
        const recoveredAddress = ethers.verifyMessage(user.nonce as string, signature);
        if(recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
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
 * @route POST /api/v1/auth/submit-kyc
 * @description Protected route. Uploads NID and Selfie, updates status to pending.
 */
const submitKyc = asyncHandler(async (req: CustomRequest, res: Response) => {
    const {nidNumber} = req.body as ISubmitKyc;
    const userId = req.user?._id;

    if(!nidNumber) {
        throw new ApiError(400, "NID Number is required");
    }

    const user = await User.findById(userId);
    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if(!user.walletAddress) {
        throw new ApiError(403, "Please link your wallet before submitting KYC");
    }
    
    if(user.kycStatus === 'pending' || user.kycStatus === 'verified') {
        throw new ApiError(400, `KYC is already ${user.kycStatus}`)
    }

    const nidExists = await User.findOne({nidNumber});
    if(nidExists) {
        throw new ApiError(409, "This NID is already registered to another account");
    }

    const files = req.files as {[fieldname: string]: Express.Multer.File[]};
    const nidImageLocalPath = files?.nidImage?.[0]?.path;
    const selfieLocalPath = files?.selfieWithNid?.[0]?.path;

    if(!nidImageLocalPath || !selfieLocalPath) {
        throw new ApiError(400, "NID and Selfie images are required");
    }

    const nidImage = await uploadOnCloudinary(nidImageLocalPath);
    const selfie = await uploadOnCloudinary(selfieLocalPath);

    if(!nidImage || !selfie) {
        throw new ApiError(500, "Failed to upload images to Cloudinary");
    }

    user.nidNumber = nidNumber;
    user.nidImageUrl = nidImage.url;
    user.selfieWithNidUrl = selfie.url;
    user.kycStatus = 'pending';

    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, {kycStatus: user.kycStatus}, "KYC submitted successfully. Pending admin approval.")
    )
});

/**
 * @route POST /api/v1/auth/refresh-token
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
 * @route POST /api/v1/auth/logout
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
            new: true
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
    submitKyc,
    refreshAccessToken,
    logoutUser
}