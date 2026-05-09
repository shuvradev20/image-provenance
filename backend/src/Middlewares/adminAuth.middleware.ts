import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { Admin, type IAdmin } from "../Models/admin.models.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";


export interface AdminRequest extends Request {
    admin?: IAdmin;
}

/**
 * @middleware verifyAdmin
 * @description Verifies if the request is coming from a logged-in Admin/SuperAdmin.
 */
export const verifyAdmin = asyncHandler(async (req: AdminRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.adminAccessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request. No admin token found.");
    }

    try {
        const decodedToken = jwt.verify(token, config.adminAccessTokenSecret) as JwtPayload;
        
        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken");

        if (!admin) {
            throw new ApiError(401, "Invalid Access Token. Admin not found.");
        }

        req.admin = admin;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid or expired admin token");
    }
});

/**
 * @middleware isSuperAdmin
 * @description Strictly verifies if the admin is the ultimate 'superAdmin'.
 * Must be used AFTER verifyAdmin middleware.
 */
export const isSuperAdmin = asyncHandler(async (req: AdminRequest, res: Response, next: NextFunction) => {
    const admin = req.admin;

    if (!admin) {
        throw new ApiError(401, "Unauthorized request. Admin session not found.");
    }

    if (admin.role !== "superAdmin") {
        throw new ApiError(403, "Access denied! Only the Super Admin can perform this action.");
    }

    next();
});