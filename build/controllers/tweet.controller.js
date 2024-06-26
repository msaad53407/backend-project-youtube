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
exports.deleteTweet = exports.updateTweet = exports.getUserTweets = exports.createTweet = void 0;
const mongoose_1 = require("mongoose");
const tweet_model_1 = require("../models/tweet.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const asyncHandler_1 = require("../utils/asyncHandler");
const createTweet = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tweetContent } = req.body;
    const userId = req.user._id;
    if (!tweetContent || tweetContent.trim() === "") {
        throw new ApiError_1.default(401, "Post Content is required");
    }
    try {
        const newTweet = yield tweet_model_1.Tweet.create({
            content: tweetContent,
            owner: userId,
        });
        if (!newTweet) {
            throw new ApiError_1.default(500, "Post could not be created");
        }
        return res
            .status(201)
            .json(new ApiResponse_1.default(201, newTweet, "Post created Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Post could not be created - " + error);
    }
}));
exports.createTweet = createTweet;
const getUserTweets = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId || userId.trim() === "" || !(0, mongoose_1.isValidObjectId)(userId)) {
        throw new ApiError_1.default(401, "User Id is required");
    }
    try {
        const tweets = yield tweet_model_1.Tweet.find({
            owner: userId,
        }).exec();
        if (!tweets || tweets.length === 0) {
            throw new ApiError_1.default(401, "No Posts found for the given User");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, tweets, "Posts fetched Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Posts could not be fetched - " + error);
    }
}));
exports.getUserTweets = getUserTweets;
const updateTweet = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tweetId } = req.params;
    if (!tweetId || tweetId.trim() === "" || !(0, mongoose_1.isValidObjectId)(tweetId)) {
        throw new ApiError_1.default(401, "Post Id is Required");
    }
    const { updatedPostContent } = req.body;
    if (!updatedPostContent || updatedPostContent.trim() === "") {
        throw new ApiError_1.default(401, "Post content is required to update it");
    }
    try {
        const updatedTweet = yield tweet_model_1.Tweet.findByIdAndUpdate(tweetId, {
            $set: {
                content: updatedPostContent,
            },
        }, {
            new: true,
        });
        if (!updatedTweet) {
            throw new ApiError_1.default(401, "No Post found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedTweet, "Post updated Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could ot fetch Post - " + error);
    }
}));
exports.updateTweet = updateTweet;
const deleteTweet = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tweetId } = req.params;
    if (!tweetId || tweetId.trim() === "" || !(0, mongoose_1.isValidObjectId)(tweetId)) {
        throw new ApiError_1.default(400, "Tweet Id is required.");
    }
    try {
        const deletedTweet = yield tweet_model_1.Tweet.findByIdAndDelete(tweetId);
        if (!deletedTweet) {
            throw new ApiError_1.default(500, "Post could not be deleted");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, null, "Post deleted Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Post could not be deleted - " + error);
    }
}));
exports.deleteTweet = deleteTweet;
