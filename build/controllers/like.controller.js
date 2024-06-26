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
exports.getLikedVideos = exports.toggleVideoLike = exports.toggleTweetLike = exports.toggleCommentLike = void 0;
const mongoose_1 = require("mongoose");
const like_model_1 = require("../models/like.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const asyncHandler_1 = require("../utils/asyncHandler");
const toggleVideoLike = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { videoId } = req.params;
    if (!videoId || !(0, mongoose_1.isValidObjectId)(videoId) || videoId.trim() === "") {
        throw new ApiError_1.default(400, "Video Id is required.");
    }
    const userId = req.user._id;
    if (!userId || !(0, mongoose_1.isValidObjectId)(userId)) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    try {
        const deletedVideoLike = yield like_model_1.Like.findOneAndDelete({
            video: videoId,
            likedBy: userId,
        });
        if (deletedVideoLike) {
            return res
                .status(200)
                .json(new ApiResponse_1.default(200, null, "Unliked Video Successfully"));
        }
        const newLike = yield like_model_1.Like.create({
            video: videoId,
            likedBy: userId,
        });
        if (!newLike) {
            throw new ApiError_1.default(500, "Could not like Video");
        }
        return res
            .status(201)
            .json(new ApiResponse_1.default(201, null, "Liked Video Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Internal Server Error");
    }
}));
exports.toggleVideoLike = toggleVideoLike;
const toggleCommentLike = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.params;
    if (!commentId || !(0, mongoose_1.isValidObjectId)(commentId) || commentId.trim() === "") {
        throw new ApiError_1.default(400, "Comment Id is required.");
    }
    const userId = req.user._id;
    if (!userId || !(0, mongoose_1.isValidObjectId)(userId)) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    try {
        const deletedCommentLike = yield like_model_1.Like.findOneAndDelete({
            comment: commentId,
            likedBy: userId,
        });
        if (deletedCommentLike) {
            return res
                .status(200)
                .json(new ApiResponse_1.default(200, null, "Unliked Comment Successfully"));
        }
        const newLike = yield like_model_1.Like.create({
            comment: commentId,
            likedBy: userId,
        });
        if (!newLike) {
            throw new ApiError_1.default(500, "Could not like Comment");
        }
        return res
            .status(201)
            .json(new ApiResponse_1.default(201, null, "Liked Comment Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not toggle Comment like - " + error);
    }
}));
exports.toggleCommentLike = toggleCommentLike;
const toggleTweetLike = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tweetId } = req.params;
    if (!tweetId || !(0, mongoose_1.isValidObjectId)(tweetId) || tweetId.trim() === "") {
        throw new ApiError_1.default(400, "Post Id is required.");
    }
    const userId = req.user._id;
    if (!userId || !(0, mongoose_1.isValidObjectId)(userId)) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    try {
        const deletedTweetLike = yield like_model_1.Like.findOneAndDelete({
            tweet: tweetId,
            likedBy: userId,
        });
        if (deletedTweetLike) {
            return res
                .status(200)
                .json(new ApiResponse_1.default(200, null, "Unliked Post Successfully"));
        }
        const newLike = yield like_model_1.Like.create({
            tweet: tweetId,
            likedBy: userId,
        });
        if (!newLike) {
            throw new ApiError_1.default(500, "Could not like Post");
        }
        return res
            .status(201)
            .json(new ApiResponse_1.default(201, null, "Liked Post Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not toggle Post like - " + error);
    }
}));
exports.toggleTweetLike = toggleTweetLike;
const getLikedVideos = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    if (!userId || !(0, mongoose_1.isValidObjectId)(userId)) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    try {
        const likedVideos = yield like_model_1.Like.find({
            likedBy: userId,
            $and: [
                {
                    tweet: null,
                },
                {
                    comment: null,
                },
            ],
        });
        if (!likedVideos || likedVideos.length === 0) {
            throw new ApiError_1.default(500, "No Liked Videos");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, likedVideos, "Liked videos fetched Successfully."));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not fetch liked videos - " + error);
    }
}));
exports.getLikedVideos = getLikedVideos;
