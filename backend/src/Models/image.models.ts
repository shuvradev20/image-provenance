import mongoose, { Schema, type Document } from "mongoose";

// --- Image Provenance Interface ---

export interface IHistory {
    action: 'minted' | 'metadata_updated' | 'transferred' | 'burned';
    actor: string;
    timestamp: Date;
    transactionHash: string
}

/**
 * @interface IImage
 * @description Represents the digital provenance and metadata of an image.
 * This interface bridges our MongoDB storage with IPFS and Blockchain data, 
 * ensuring every image has a verifiable history.
 */
export interface IImage extends Document {
    uploader: String;
    currentOwner: string;
    title: string;
    description: string;
    assetCategory: 'photography' | 'digital_art' | 'ai_generated' | 'news_media' | 'illustration' | 'other';
    tags: string[]; 
    fileDetails: {
        fileType: string; 
        fileSize: number; 
        width: number;    
        height: number;   
    };
    imageHash: string; // Unique cryptographic hash of the raw image data
    watermarkID: string;
    imageCID: string; // IPFS Content Identifier for the image file
    metadataCID: string; // CID of the JSON file containing all info, including the CID of image
    thumbnailUrl: string;
    originalAssetHash: string;
    transactionHash?: string;
    status: 'pending' | 'verified' | 'burned';
    history: IHistory[];
}

const imageSchema = new Schema<IImage>({
    uploader: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    currentOwner: {
        type: String,
        required: true,
        trim: true,
        index: true
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
    assetCategory: {
        type: String,
        enum: ['photography', 'digital_art', 'ai_generated', 'news_media', 'illustration', 'other'],
        required: true,
        index: true // Indexed because users will filter by category in the marketplace
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
    }],    
    fileDetails: {
        fileType: { type: String, required: true },
        fileSize: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    imageHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    watermarkID: {
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
    thumbnailUrl: {
        type: String,
        required: true
    },
    originalAssetHash: {
        type: String,
        required: true,
        unique: true
    },
    transactionHash: {
        type: String,
        unique: true,
        sparse: true // Allows multiple 'pending' images without a transaction hash yet
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'burned'],
        default: 'pending'
    },
    history: [{
        action: { 
            type: String, 
            required: true 
        },
        actor: { 
            type: String, 
            required: true 
        },
        timestamp: { 
            type: Date, 
            required: true 
        },
        transactionHash: { 
        type: String, 
        required: true 
        }
    }]
}, { timestamps: true });

export const Image = mongoose.model<IImage>("Image", imageSchema);