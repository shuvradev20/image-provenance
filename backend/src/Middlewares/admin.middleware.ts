import { type Response, type NextFunction } from "express"
import { ApiError } from "../Utils/ApiError.js"
import { type CustomRequest } from "./auth.middleware.js"
import { asyncHandler } from "../Utils/asyncHandler.js"

export const isAdmin = asyncHandler(async(req: CustomRequest, res: Response, next: NextFunction) => {
    const user = req.user

    if(!user) {
        throw new ApiError(401, "Anauthorized request. User not found")
    }

    if(user.role !== "owner") {
        throw new ApiError(403, "Access denied! You do not have admin privilage.")
    }

    next();
});