import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model"
import { Subscription } from "../models/subscription.model"
import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { Response } from "express"
import { ExtendedRequest } from "../middlewares/auth.middleware"


const toggleSubscription = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { channelId } = req.params
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { channelId } = req.params
})

// controller to return channel list to which user has subscribed - UPDATE below mentioned subscriberId is actually the user whose subscriptions are to be fetched.
const getSubscribedChannels = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}