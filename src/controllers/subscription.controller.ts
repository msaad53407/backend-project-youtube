import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";
import { Subscription } from "../models/subscription.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Response } from "express";
import { ExtendedRequest } from "../middlewares/auth.middleware";

const toggleSubscription = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { channelId } = req.params;

    if (!channelId || !isValidObjectId(channelId) || channelId.trim() === "") {
      throw new ApiError(400, "Invalid Channel Id");
    }

    const userId = req.user._id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (userId.toString() === channelId) {
      throw new ApiError(403, "Cannot subscribe to Yourself");
    }

    try {
      const userSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId,
      });

      if (userSubscription) {
        const deletedSubscription = await Subscription.findByIdAndDelete(
          userSubscription._id
        );

        if (!deletedSubscription) {
          throw new ApiError(502, "Could not unsubscribe");
        }

        return res
          .status(200)
          .json(new ApiResponse(200, null, "Unsubscribed Successfully"));
      }

      const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: userId,
      });

      if (!newSubscription) {
        throw new ApiError(502, "Could not subscribe");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Subscribed Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could not toggle subscription - " + error);
    }
  }
);

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { channelId } = req.params;

    // I have been given a channel Id whose subscribers I have to fetch.
    // subscribers are actually users that I have to fetch.
    // I have to make a query on Subscription model, such that only those subscription documents are returned that have channel id matching to given channel id;
    // Next, the count of subscriber field in each document is actually the number of subscribers.

    if (!channelId || !isValidObjectId(channelId) || channelId.trim() === "") {
      throw new ApiError(400, "Invalid Channel Id");
    }

    try {
      const subscriptionsArray = await Subscription.find({
        channel: channelId,
      }).exec();

      if (!subscriptionsArray || subscriptionsArray.length === 0) {
        throw new ApiError(401, "No Subscribers Found");
      }

      const subscribers = await User.find({
        _id: {
          $in: subscriptionsArray.map(
            (subscription) => subscription.subscriber
          ),
        },
      }).select("-password -refreshToken -watchHistory");

      if (!subscribers || subscribers.length === 0) {
        throw new ApiError(401, "No Subscribers found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, subscribers, "Subscribers Fetched Successfully")
        );
    } catch (error) {
      throw new ApiError(500, "Could not fetch Subscribers - " + error);
    }
  }
);

// controller to return channel list to which user has subscribed - UPDATE below mentioned subscriberId is actually the user whose subscriptions are to be fetched.
const getSubscribedChannels = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { subscriberId } = req.params;

    if (
      !subscriberId ||
      !isValidObjectId(subscriberId) ||
      subscriberId.trim() === ""
    ) {
      throw new ApiError(400, "Invalid Channel Id");
    }

    try {
      const subscriptionsArray = await Subscription.find({
        subscriber: subscriberId,
      }).exec();

      if (!subscriptionsArray || subscriptionsArray.length === 0) {
        throw new ApiError(401, "No Subscribed Channels Found");
      }

      const channels = await User.find({
        _id: {
          $in: subscriptionsArray.map((subscription) => subscription.channel),
        },
      }).select("-password -refreshToken -watchHistory");

      if (!channels || channels.length === 0) {
        throw new ApiError(401, "No Subscribed Channels found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            channels,
            "Subscribed Channels Fetched Successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Could not fetch Subscribed Channels - " + error);
    }
  }
);

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
