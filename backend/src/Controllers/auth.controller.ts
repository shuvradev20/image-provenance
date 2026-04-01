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



const generateAccessTokenAndRefreshTokens = async (userId: any) => {
    try {
        const user = await User.findById(userId);

        if(!user) {
            throw new ApiError(404, "User not found while generating tokens")
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false})

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const {fullName, email, walletAddress, nidNumber} = req.body;

    if(!fullName || !email || !walletAddress || !nidNumber) {
        throw new ApiError(400, "All fields (fullName, email, walletAddress, nidNumber) are required")
    }

    const existedUser = await User.findOne({
        $or: [{email},{nidNumber}, {walletAddress: walletAddress.toLowerCase()}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with this email or wallet address or nidNumber already exists");
    }

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

const getNonce = asyncHandler(async (req: Request, res: Response) => {
    const {walletAddress} = req.params;

    if(!walletAddress) {
        throw new ApiError(400, "Wallet address is required");
    }

    const user = await User.findOne({walletAddress: walletAddress})

    if (!user) {
        throw new ApiError(404, "User not found. Please register first")
    }

    return res.status(200).json(
        new ApiResponse(200, {nonce: user.nonce}, "Nonce fetched successfully")
    )
})

const verifySignature = asyncHandler(async (req: Request, res: Response) => {
    const {walletAddress, signature} = req.body;

    if (!walletAddress || !signature) {
        throw new ApiError(400, "Wallet address and signature are required")
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    try {
        const recoveredAddress = ethers.verifyMessage(user.nonce, signature)

        if(recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()){
            throw new ApiError(401, "Invalid SIgnature! Hacker detected!")
        }

        user.nonce = Math.floor(Math.random() * 1000000).toString()
        await user.save({ validateBeforeSave: false});

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        const loggedInUser = await User.findById(user._id).select("-refreshToken")

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
        console.error("Signature Verifiaction Error: ", error)
        throw new ApiError(400, "Invalid signature format")
    }
})

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

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

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