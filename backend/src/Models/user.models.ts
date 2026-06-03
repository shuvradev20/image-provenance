import mongoose, {Schema, type Document} from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config.js"


/**
 * @interface IUser
 * @description Defines the core User entity for the system. 
 * Supports a hybrid authentication model (Web3 Wallet + Traditional Identity).
 */
export interface IUser extends Document {
    fullName?: string | undefined;
    email?: string | undefined;
    googleId?: string | undefined;
    walletAddress?: string | undefined;
    nonce?: string | undefined; // Used for cryptographically signing messages in Web3 auth
    bio?: string | undefined;
    profileImage?: string | undefined;
    coverImage?: string | undefined;
    location?: string | undefined;
    socialLinks?: {
        platform: string;
        url: string;
    }[] | undefined;
    governmentId?: string | undefined;
    govIdImageUrl?: string | undefined;
    selfieWithGovIdUrl?: string | undefined;
    kycStatus: 'unverified' | 'pending' | 'processing' | 'verified';
    kycSubmittedAt?: Date | null | undefined;
    kycVerifiedAt?: Date | null | undefined;
    isBlockchainRegistered: boolean; // Becomes true after admin calls Smart Contract
    refreshToken?: string | undefined;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
     fullName: {
        type: String,
        default: "Unnamed Creator",
        trim: true
    },
    email: {
        type: String,
        sparse: true,
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
        unique: true,
        sparse: true, 
        lowercase: true,
        trim: true
    },
    nonce: {
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
    coverImage: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        trim: true,
        maxLength: 50
    },
    socialLinks: [{
        platform: { type: String, trim: true },
        url: { type: String, trim: true }
    }],
    governmentId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    govIdImageUrl: {
        type: String
    },
    selfieWithGovIdUrl: {
        type: String,
    },
    kycStatus: { 
        type: String, 
        enum: ['unverified', 'pending', 'processing', 'verified'], 
        default: 'unverified'
    },
    kycSubmittedAt: {
        type: Date,
        default: null
    },
    kycVerifiedAt: {
        type: Date,
        default: null
    },
    isBlockchainRegistered: { 
        type: Boolean, 
        default: false 
    },
    refreshToken: {
        type: String
    },
}, {timestamps: true});


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