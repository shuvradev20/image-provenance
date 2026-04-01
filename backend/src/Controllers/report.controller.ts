import { type Request, type Response } from "express";
import { type CustomRequest } from "../Middlewares/auth.middleware.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Image } from "../Models/image.models.js";
import { Report } from "../Models/report.models.js";


const reportImage = asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest;
    const { hash } = req.params;
    const { reportType, proofHash, reason } = req.body;

    if(!customReq.user) {
        throw new ApiError(401, "You must be logged in to report an image");
    }

    if (!hash || Array.isArray(hash)) {
        throw new ApiError(400, "Image hash is required in the URL parameters");
    }

    const reporterId = customReq.user._id;

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

const getAllReports = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    const query = status ? {status} : {};

    const reports = await Report.find(query)
        .populate("reporter", "fullName email nid")
        .populate("reportedImage", "imagehash currentOwner metadataCID isBurned isTampered")
        .sort({ createdAt: -1})

    return res.status(200).json(
        new ApiResponse(200, reports, "Reports fetched successfully")
    )
})

const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
    const { reportId } = req.params
    const { status, adminNote } = req.body;

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