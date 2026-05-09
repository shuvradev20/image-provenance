import mongoose, {Schema, type Document} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export interface IAdmin extends Document {
    fullName: string;
    email: string;
    password: string;
    role: 'superAdmin' | 'admin';
    refreshToken?: string;
    generateAccessToken(): string;
    generateRefreshToken(): string;
    comparePassword(password: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>({
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
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['superAdmin', 'admin'],
        default: 'admin'
    },
    refreshToken: {
        type: String
    },
}, {timestamps: true});

adminSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

adminSchema.methods.comparePassword = async function(password: string) {
    return await bcrypt.compare(password, this.password)
}

adminSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            role: this.role,
            email: this.email
        },
        config.adminAccessTokenSecret,
        { expiresIn: config.adminAccessTokenExpiry} as jwt.SignOptions
    );
};

adminSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {_id: this._id},
        config.adminRefreshTokenSecret,
        {expiresIn: config.adminRefreshTokenExpiry} as jwt.SignOptions
    );
};

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);