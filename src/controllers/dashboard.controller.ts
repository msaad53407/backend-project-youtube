import { Video } from "../models/video.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Response } from "express";
import { ExtendedRequest } from "../middlewares/auth.middleware";
import { User } from "../models/user.model";

const getChannelStats = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const user = req.user._id;
    if (!user) {
      throw new ApiError(400, "Unauthorized Request");
    }

    try {
      //TODO Document the entire pipeline.
      const channelStats = await User.aggregate([
        { $match: { _id: user } },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers",
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo",
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "_id",
            foreignField: "owner",
            as: "userVideos",
            pipeline: [
              {
                $lookup: {
                  from: "comments",
                  localField: "_id",
                  foreignField: "video",
                  as: "comments",
                },
              },
              {
                $lookup: {
                  from: "likes",
                  localField: "_id",
                  foreignField: "video",
                  as: "likedVideos",
                },
              },
              {
                $addFields: {
                  commentsCount: { $size: "$comments" },
                  videoLikesCount: { $size: "$likedVideos" },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "tweets",
            localField: "_id",
            foreignField: "owner",
            as: "tweets",
            //! Commented Pipeline will be used when we want to obtain total likes count of all tweets but it is uncompleted.
            // pipeline: [
            //   {
            //     $lookup: {
            //       from: "likes",
            //       localField: "_id",
            //       foreignField: "tweet",
            //       as: "tweetsLiked",
            //     },
            //   },
            //   {
            //     $addFields: {
            //       tweetsLikedCount: { $size: "$tweetsLiked" },
            //     },
            //   },
            // ],
          },
        },
        {
          $unwind: "$userVideos",
        },
        {
          $group: {
            _id: "$_id",
            totalVideos: { $sum: 1 },
            totalViews: { $sum: "$views" },
            subscribers: { $first: "$subscribers" },
            subscribedTo: { $first: "$subscribedTo" },
            totalVideoLikes: { $sum: "$userVideos.videoLikesCount" },
            totalComments: { $sum: "$userVideos.commentsCount" },
            totalTweets: { $first: { $size: "$tweets" } },
          },
        },
        //TODO Add the tweets liked count
        {
          $project: {
            _id: 0,
            totalVideos: 1,
            totalViews: 1,
            subscribers: { $size: "$subscribers" },
            subscribedTo: { $size: "$subscribedTo" },
            totalVideoLikes: 1,
            totalComments: 1,
            totalTweets: 1,
          },
        },
      ]);

      if (!channelStats || channelStats.length === 0) {
        throw new ApiError(404, "No Channel Stats Found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            channelStats[0],
            "Channel Stats retrieved successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Could not get channel stats - " + error);
    }
  }
);

const getChannelVideos = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const user = req.user._id;

    if (!user) {
      throw new ApiError(400, "Unauthorized Request");
    }

    try {
      const videos = await Video.find({ owner: user });
      if (!videos || videos.length === 0) {
        throw new ApiError(404, "No Videos Found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, videos, "Channel Videos fetched successfully")
        );
    } catch (error) {
      throw new ApiError(500, "Could not get channel videos - " + error);
    }
  }
);

export { getChannelStats, getChannelVideos };
