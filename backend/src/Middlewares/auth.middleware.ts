import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { User, type IUser } from "../Models/user.models.js";
import config from "../config/config.js";

/**
 * @interface CustomRequest
 * @description Extends the default Express Request object to include the authenticated user.
 * This prevents TypeScript errors when attaching the user object to the request.
 */
export interface CustomRequest extends Request {
    user?:IUser;
}

/**
 * @middleware verifyJWT
 * @description Acts as the primary security gateway for protected routes. 
 * Extracts the JWT from cookies or headers, verifies its authenticity, 
 * and attaches the corresponding user to the request object.
 */
export const verifyJWT = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        // The space after "Bearer " is crucial to avoid parsing errors
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token found");
        }

        const decodedToken = jwt.verify(token, config.accessTokenSecret) as JwtPayload

        const user = await User.findById(decodedToken?._id).select("-refreshToken")

        if(!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user as IUser;

        next();

    } catch (error) {
        throw new ApiError(401, "Invalid access Token")
    }
})