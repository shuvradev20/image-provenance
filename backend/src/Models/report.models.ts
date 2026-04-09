import mongoose, { Schema, type Document } from "mongoose";

// --- Image Reporting Interface ---

/**
 * @interface IReport
 * @description Defines the structure for reporting suspicious or infringing images.
 * This model facilitates the moderation workflow, allowing users to flag content 
 * for copyright violations, impersonation, or other policy breaches.
 */
export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    reportedImage: mongoose.Types.ObjectId;
    imageHash: string; // Snapshotted hash of the reported image for audit persistence
    reportType: 'Copyright Violation' | 'Inappropriate Content' | 'Spam' | 'Other';
    proofHash?: string | null; // IPFS CID or cryptographic hash provided as evidence by the reporter
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'ignored';
    adminNote?: string;
}

// --- Database Schema Definition ---

const reportSchema = new Schema<IReport>({
    reporter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reportedImage: {
        type: Schema.Types.ObjectId,
        ref: 'Image',
        required: true,
        index: true
    },
    imageHash: {
        type: String,
        required: true
    },
    reportType: {
        type: String,
        enum: ['Copyright Violation', 'Inappropriate Content', 'Spam', 'Other'],
        required: true
    },
    proofHash: {
        type: String,
        trim: true,
        required: false
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'ignored'],
        default: 'pending'
    },
    adminNote: {
        type: String,
        trim: true
    }
}, { timestamps: true });

export const Report = mongoose.model<IReport>("Report", reportSchema);