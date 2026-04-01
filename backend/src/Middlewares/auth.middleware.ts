import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { User, type IUser } from "../Models/user.model.js";
import config from "../config/config.js";

export interface CustomRequest extends Request {
    user?:IUser;
}

export const verifyJWT = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
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