import mongoose from "mongoose"
import { Comment } from "../models/comment.model"
import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { Request, Response } from "express"
import { ExtendedRequest } from "../middlewares/auth.middleware"

const getVideoComments = asyncHandler(async (req: Request, res: Response) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

})

const addComment = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    // TODO: delete a comment
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}