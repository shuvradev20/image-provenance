import mongoose, { Schema, type Document } from "mongoose";

export type ActivityEventType = 
    | 'UserRegistered' 
    | 'ImageMinted' 
    | 'MetadataUpdated' 
    | 'ImageTransferred' 
    | 'ImageBurned';

export interface IActivity extends Document {
    eventType: ActivityEventType;
    actor: string;              
    targetUser?: string;        
    transactionHash: string;    
    gasUsed?: string;           
    blockNumber?: number;       
    blockTimestamp: Date;       
    createdAt: Date;
    updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
    eventType: {
        type: String,
        required: true,
        enum: ['UserRegistered', 'ImageMinted', 'MetadataUpdated', 'ImageTransferred', 'ImageBurned'],
        index: true
    },
    actor: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    targetUser: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        default: null
    },
    transactionHash: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    gasUsed: {
        type: String,
        default: "0.0002"
    },
    blockNumber: {
        type: Number
    },
    blockTimestamp: {
        type: Date,
        required: true,
        index: true
    }
}, { timestamps: true });

activitySchema.index({ actor: 1, blockTimestamp: -1 });
activitySchema.index({ targetUser: 1, blockTimestamp: -1 });

export const Activity = mongoose.model<IActivity>("Activity", activitySchema);