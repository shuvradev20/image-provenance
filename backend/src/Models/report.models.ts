import mongoose, { Schema, type Document } from "mongoose";

export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    reportedImage: mongoose.Types.ObjectId;
    imageHash: string;
    reportType: 'Copyright Violation' | 'Inappropriate Content' | 'Impersonation' | 'Other';
    proofHash?: string | null;
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'ignored';
    adminNote?: string;
}

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
        enum: ['Copyright Violation', 'Inappropriate Content', 'Impersonation', 'Other'],
        required: true
    },
    proofHash: {
        type: String,
        trim: true,
        required: true
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