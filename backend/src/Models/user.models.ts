import mongoose, {Schema, type Document} from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config.js"

// --- User Model Interface ---

/**
 * @interface IUser
 * @description Defines the core User entity for the system. 
 * Supports a hybrid authentication model (Web3 Wallet + Traditional Identity).
 */
export interface IUser extends Document {
    fullName: string;
    email: string;
    googleId?: string;
    walletAddress?: string;
    nonce?: string; // Used for cryptographically signing messages in Web3 auth
    bio?: string;
    profileImage?: string;
    nidNumber?: string | undefined;
    nidImageUrl?: string | undefined;
    selfieWithNidUrl?: string | undefined;
    role: 'user' | 'admin'
    kycStatus: 'unverified' | 'pending' | 'verified';
    isBlockchainRegistered: boolean; // Becomes true after admin calls Smart Contract
    refreshToken?: string;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

// --- Database Schema Definition ---

const userSchema = new Schema<IUser>({
     fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    googleId: {
        type: String, 
        sparse: true, 
        unique: true
    },
    walletAddress: {
        type: String,
        sparse: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    
    nonce: {
        type: String,
    },
    nidNumber: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple nulls while maintaining uniqueness for provided values
        trim: true
    },
    nidImageUrl: {
        type: String
    },
    selfieWithNidUrl: {
        type: String,
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 250
    },
    profileImage: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    kycStatus: { 
        type: String, 
        enum: ['unverified', 'pending', 'verified'], 
        default: 'unverified' // Default is unverified at Step 1
    },
    isBlockchainRegistered: { 
        type: Boolean, 
        default: false 
    },
    refreshToken: {
        type: String
    },
}, {timestamps: true});

// --- Instance Methods (Auth) ---

/**
 * @method generateAccessToken
 * @description Generates a short-lived JWT Access Token containing user identification and role permissions.
 * @returns {string} Signed JWT Access Token
 */
userSchema.methods.generateAccessToken = function (): string {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            walletAddress: this.walletAddress,
            fullName: this.fullName,
            role: this.role
        },
        config.accessTokenSecret,
        {
            expiresIn: config.accessTokenExpiry
        } as jwt.SignOptions
    );
};

/**
 * @method generateRefreshToken
 * @description Generates a long-lived JWT Refresh Token to allow users to renew access without re-authenticating.
 * @returns {string} Signed JWT Refresh Token
 */
userSchema.methods.generateRefreshToken = function (): string {
    return jwt.sign(
        {
            _id: this._id,
        },
        config.refreshTokenSecret,
        {
            expiresIn: config.refreshTokenExpiry
        } as jwt.SignOptions
    )
}

export const User = mongoose.model<IUser>("User", userSchema);