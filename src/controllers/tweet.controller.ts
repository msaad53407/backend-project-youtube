import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model"
import { User } from "../models/user.model"
import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { ExtendedRequest } from "../middlewares/auth.middleware"
import { Request, Response } from "express"

const createTweet = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req: Request, res: Response) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}