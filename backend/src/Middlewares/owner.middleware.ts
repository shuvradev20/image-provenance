import { type Response, type NextFunction } from "express";
import { ApiError } from "../Utils/ApiError.js";
import { type CustomRequest } from "./auth.middleware.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

/**
 * @middleware isOwner
 * @description Strictly verifies if the user is the ultimate 'owner' of the platform.
 * Used for highly sensitive operations like promoting or demoting other admins.
 */
export const isOwner = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized request. User session not found.");
    }

    // Strict check: Only the single platform owner can pass
    if (user.role !== "owner") {
        throw new ApiError(403, "Access denied! Only the platform owner can perform this action.");
    }

    next();
});