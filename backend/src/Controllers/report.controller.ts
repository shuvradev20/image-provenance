import { type Request, type Response } from "express";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Image } from "../Models/image.models.js";
import { Report } from "../Models/report.models.js";

// --- Interfaces for Request Data ---

/**
 * @interface IReportImageRequest
 * @description Structure for reporting an image, including optional copyright proof.
 */
interface IReportImageRequest {
    reportType: 'Copyright Violation' | 'Inappropriate Content' | 'Spam' | 'Other';
    proofHash?: string;
    reason: string;
}

/**
 * @interface IUpdateReportStatusRequest
 * @description Structure for admin to update a report's lifecycle status.
 */
interface IUpdateReportStatusRequest {
    status: 'reviewed' | 'resolved' | 'ignored';
    adminNote?: string;
}

// --- Image Reporting ---

/**
 * @route POST /api/v1/reports/submit/:hash
 * @description Allows authenticated users to report images for violations.
 * Requires a proof hash specifically for copyright claims to maintain provenance integrity.
 */
const reportImage = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;
    const { hash } = req.params;

    // Using Interface to strictly define body types
    const { reportType, proofHash, reason } = req.body as IReportImageRequest

    // Type Guard for URL parameters
    if(!customReq.user) {
        throw new ApiError(401, "You must be logged in to report an image");
    }

    if (!hash || typeof hash !== 'string') {
        throw new ApiError(400, "A valid Image hash is required in the URL parameters");
    }

    const reporterId = customReq.user._id;

    // Strict validation for copyright claims
    if(!reportType || !reason || reason.trim() === "") {
        throw new ApiError(400, "Report type and reason are mendatory");
    }

    if( reportType === 'Copyright Violation' && (!proofHash || proofHash.trim() === "")) {
        throw new ApiError(400, "STRICT: You must provide the original Image Hash (Proof) for copyright claims." )
    }

    const image = await Image.findOne({ imageHash: hash});

    if(!image) {
        throw new ApiError(404, "Image not found")
    }

    // One report per user per image
    const existingReport = await Report.findOne({reportedImage: image._id, reporter: reporterId})

    if(existingReport) {
        throw new ApiError(400, "You have already reported this image.")
    }

    const newReport = await Report.create({
        reporter: reporterId,
        reportedImage: image._id,
        imageHash: hash,
        reportType: reportType,
        reason: reason,
        proofHash: proofHash ? proofHash.trim() : null,
        status: 'pending'
    })

    return res.status(200).json(
        new ApiResponse(200, {reportId: newReport._id}, "Report successfully submitted!")
    )
})

// --- Admin Reporting Management ---

/**
 * @route GET /api/v1/reports/all
 * @description Retrieves all reports, optionally filtered by status.
 * Heavily populated to provide admins with full context for moderation.
 */
const getAllReports = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    const query = status && typeof status === 'string' ? {status} : {};

    const reports = await Report.find(query)
        .populate("reporter", "fullName email nid")
        .populate("reportedImage", "imagehash currentOwner metadataCID isBurned isTampered")
        .sort({ createdAt: -1})

    return res.status(200).json(
        new ApiResponse(200, reports, "Reports fetched successfully")
    )
})

/**
 * @route PATCH /api/v1/reports/update-status/:reportId
 * @description Updates the moderation status of a report with admin comments.
 */
const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
    const { reportId } = req.params
    const { status, adminNote } = req.body as IUpdateReportStatusRequest;

    if (!reportId || typeof reportId !== 'string') {
        throw new ApiError(400, "Valid Report ID is required");
    }

    const validStatuses = ['reviewed', 'resolved', 'ignored'];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Imvalid status. Mush be 'reviewed', 'resolved', 'ignored' ")
    }

    const report = await Report.findById(reportId);

    if(!report) {
        throw new ApiError(404, "Report not found");
    }

    report.status = status;

    if(adminNote) {
        report.adminNote = adminNote;
    }

    await report.save();

    return res.status(200).json(
        new ApiResponse(200, report, `Report status updated to ${status}`)
    )
})



export {
    reportImage,
    getAllReports,
    updateReportStatus
}