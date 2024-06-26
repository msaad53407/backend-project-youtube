"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelVideos = exports.getChannelStats = void 0;
const video_model_1 = require("../models/video.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const asyncHandler_1 = require("../utils/asyncHandler");
const user_model_1 = require("../models/user.model");
const getChannelStats = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user._id;
    if (!user) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    try {
        //TODO Document the entire pipeline.
        const channelStats = yield user_model_1.User.aggregate([
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
            throw new ApiError_1.default(404, "No Channel Stats Found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, channelStats[0], "Channel Stats retrieved successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not get channel stats - " + error);
    }
}));
exports.getChannelStats = getChannelStats;
const getChannelVideos = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user._id;
    if (!user) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    try {
        const videos = yield video_model_1.Video.find({ owner: user });
        if (!videos || videos.length === 0) {
            throw new ApiError_1.default(404, "No Videos Found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, videos, "Channel Videos fetched successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not get channel videos - " + error);
    }
}));
exports.getChannelVideos = getChannelVideos;
