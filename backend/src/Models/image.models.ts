import mongoose, { Schema, type Document } from "mongoose";

// --- Image Provenance Interface ---

/**
 * @interface IImage
 * @description Represents the digital provenance and metadata of an image.
 * This interface bridges our MongoDB storage with IPFS and Blockchain data, 
 * ensuring every image has a verifiable history.
 */
export interface IImage extends Document {
    uploader: mongoose.Types.ObjectId;
    currentOwner: string;
    title: string;
    description: string;
    imageHash: string; // Unique cryptographic hash of the raw image data
    imageCID: string; // IPFS Content Identifier for the image file
    metadataCID: string; // CID of the JSON file containing all info, including the CID of image
    transactionHash?: string;
    isBurned: boolean;
    isTampered: boolean;
    walletAddress: string;
    status: 'pending' | 'verified' | 'flagged' | 'burned';
}

const imageSchema = new Schema<IImage>({
    uploader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    currentOwner: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    imageCID: {
        type: String,
        required: true,
        unique: true
    },
    metadataCID: {
        type: String,
        required: true,
        unique: true
    },
    transactionHash: {
        type: String,
        unique: true,
        sparse: true // Allows multiple 'pending' images without a transaction hash yet
    },
    isTampered: {
        type: Boolean,
        default: false
    },
    isBurned: {
        type: Boolean,
        default: false
    },
    walletAddress: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'flagged', 'burned'],
        default: 'pending'
    }
}, { timestamps: true });

export const Image = mongoose.model<IImage>("Image", imageSchema);