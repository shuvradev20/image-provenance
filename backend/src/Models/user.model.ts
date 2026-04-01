import mongoose, {Schema, type Document} from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config.js"

export interface IUser extends Document {
    walletAddress: string;
    email: string;
    nonce: string;
    fullName: string;
    bio?: string;
    profileImage?: string;
    role: 'user' | 'admin' | 'owner'
    nidNumber?: string;
    nidImageUrl?: string;
    selfieWithNidUrl?: string;
    isKycVerified: boolean;
    warningCount: number;
    refreshToken?: string;
    status: 'pending' | 'active' | 'banned';
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    nonce: {
        type: String,
        required: true,
        default: () => Math.floor(Math.random() * 1000000).toString()
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 250
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    profileImage: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user'
    },
    nidNumber: {
        type: String,
        required: function() {return this.role === 'user'},
        unique: true,
        sparse: true,
        trim: true
    },
    nidImageUrl: {
        type: String,
        required: function() {return this.role === 'user'}
    },
    selfieWithNidUrl: {
        type: String,
        required: function() {return this.role === 'user'}
    },
    isKycVerified: {
        type: Boolean,
        default: false
    },
    warningCount: {
        type: Number,
        default: 0,
    },
    refreshToken: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'banned'],
        default: 'pending'
    },
}, {timestamps: true});

userSchema.methods.generateAccessToken = function () {
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

userSchema.methods.generateRefreshToken = function () {
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