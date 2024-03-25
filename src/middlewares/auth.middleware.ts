import { NextFunction, Request } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import { User } from "../models/user.model";
import { UserDocument } from "../interfaces/mongoose.gen";

export interface ExtendedRequest extends Request {
    user: UserDocument;
}

export const verifyJWT = asyncHandler(async (req: ExtendedRequest, _: any, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', "")

        if (!accessToken) {
            throw new ApiError(401, "Unauthorized Request");
        }
        const userInfoFromToken: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)

        const user = await User.findById(userInfoFromToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
    } catch (error: unknown) {
        const message = (error instanceof Error) ? error.message : "Invalid Access Token";
        throw new ApiError(401, message);
    }

    next();

})