import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model"
import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { Response } from "express"
import { ExtendedRequest } from "../middlewares/auth.middleware"

const toggleVideoLike = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { videoId } = req.params
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}