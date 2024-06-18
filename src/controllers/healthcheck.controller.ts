import { Response } from "express"
import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"


const healthCheck = asyncHandler(async (_, res: Response) => {
    try {
        return res.status(200).json(
            new ApiResponse(200, null, "Server is up and running.")
        )
    } catch (error) {
        throw new ApiError(500, "Internal Server Error.")
    }
})

export {
    healthCheck
}
