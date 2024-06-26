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
exports.togglePublishStatus = exports.deleteVideo = exports.updateVideo = exports.getVideoById = exports.publishAVideo = exports.getAllVideos = void 0;
const mongoose_1 = require("mongoose");
const video_model_1 = require("../models/video.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const asyncHandler_1 = require("../utils/asyncHandler");
const cloudinary_1 = require("../lib/cloudinary");
const utils_1 = require("../utils");
const getAllVideos = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
    if (!page ||
        !limit ||
        Number(page) <= 0 ||
        Number(limit) <= 0 ||
        isNaN(Number(page)) ||
        isNaN(Number(limit))) {
        throw new ApiError_1.default(400, "Page and Limit are required should be valid numbers");
    }
    if ([query, sortBy, sortType].every((field) => field === undefined || field.toString().trim() === "")) {
        throw new ApiError_1.default(400, "Please provide all required fields");
    }
    const computedSortType = sortType === "asc" ? 1 : -1;
    try {
        const videos = yield video_model_1.Video.find({
            $or: [
                {
                    title: { $regex: query, $options: "i" },
                },
                {
                    description: { $regex: query, $options: "i" },
                },
            ],
            isPublished: true,
        }, null, {
            skip: (Number(page) - 1) * Number(limit),
            sort: sortBy
                ? { [sortBy.toString()]: computedSortType }
                : { createdAt: -1 },
            limit: Number(limit),
        });
        if (!videos || videos.length === 0) {
            throw new ApiError_1.default(404, "No Videos found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, videos, "Videos fetched Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not get Videos - " + error);
    }
}));
exports.getAllVideos = getAllVideos;
const publishAVideo = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { title, description } = req.body;
    if ([title, description].every((field) => field === undefined || field.trim() === "")) {
        throw new ApiError_1.default(400, "Please provide all required fields");
    }
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    const videoLocalPath = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.videoFile[0]) === null || _b === void 0 ? void 0 : _b.path;
    const thumbnailLocalPath = (_d = (_c = req.files) === null || _c === void 0 ? void 0 : _c.thumbnail[0]) === null || _d === void 0 ? void 0 : _d.path;
    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError_1.default(400, "Video and thumbnail are required");
    }
    const video = yield (0, cloudinary_1.uploadFile)(videoLocalPath);
    const thumbnail = yield (0, cloudinary_1.uploadFile)(thumbnailLocalPath);
    try {
        const videoDoc = yield video_model_1.Video.create({
            title,
            description,
            videoFile: video === null || video === void 0 ? void 0 : video.secure_url,
            thumbnail: thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.secure_url,
            duration: video === null || video === void 0 ? void 0 : video.duration,
            owner: userId,
        });
        if (!videoDoc) {
            throw new ApiError_1.default(500, "Could not Publish Video");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, videoDoc, "Video Published Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not Publish Video - " + error);
    }
}));
exports.publishAVideo = publishAVideo;
const getVideoById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { videoId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(videoId) || !videoId || (videoId === null || videoId === void 0 ? void 0 : videoId.trim()) === "") {
        throw new ApiError_1.default(400, "Invalid Video Id");
    }
    try {
        const video = yield video_model_1.Video.findById(videoId);
        if (!video) {
            throw new ApiError_1.default(400, "Video not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, video, "Video Fetched Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not fetch Video - " + error);
    }
}));
exports.getVideoById = getVideoById;
const updateVideo = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const { videoId } = req.params;
    const { title, description } = req.body;
    // if (!isValidObjectId(videoId) || !videoId || videoId?.trim() === "") {
    //   throw new ApiError(400, "Invalid Video Id");
    // }
    if ([title, description].every((field) => field === undefined || field.trim() === "")) {
        throw new ApiError_1.default(400, "Please provide all required fields");
    }
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    const thumbnailLocalPath = (_f = (_e = req.files) === null || _e === void 0 ? void 0 : _e.thumbnail[0]) === null || _f === void 0 ? void 0 : _f.path;
    let updatedThumbnail = null;
    if (thumbnailLocalPath) {
        updatedThumbnail = yield (0, cloudinary_1.uploadFile)(thumbnailLocalPath);
    }
    try {
        const updatedVideo = yield video_model_1.Video.findByIdAndUpdate(videoId, [
            {
                $set: {
                    title,
                    description,
                    thumbnail: {
                        $cond: {
                            if: {
                                $or: [
                                    { $eq: [thumbnailLocalPath, undefined] },
                                    { $eq: [thumbnailLocalPath, null] },
                                    { $eq: [thumbnailLocalPath, ""] },
                                ],
                            },
                            then: "$thumbnail",
                            else: updatedThumbnail === null || updatedThumbnail === void 0 ? void 0 : updatedThumbnail.secure_url,
                        },
                    },
                },
            },
        ], { new: true });
        if (!updatedVideo) {
            throw new ApiError_1.default(404, "Video not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedVideo, "Video Updated Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not update Video - " + error);
    }
}));
exports.updateVideo = updateVideo;
const deleteVideo = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { videoId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(videoId) || !videoId || (videoId === null || videoId === void 0 ? void 0 : videoId.trim()) === "") {
        throw new ApiError_1.default(400, "Invalid Video Id");
    }
    try {
        const video = yield video_model_1.Video.findByIdAndDelete(videoId);
        if (!video) {
            throw new ApiError_1.default(400, "Video not found");
        }
        yield (0, cloudinary_1.deleteFile)((0, utils_1.extractPublicID)(video.videoFile), "video");
        yield (0, cloudinary_1.deleteFile)((0, utils_1.extractPublicID)(video.thumbnail), "image");
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, video, "Video Deleted Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not delete Video - " + error);
    }
}));
exports.deleteVideo = deleteVideo;
const togglePublishStatus = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { videoId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(videoId) || !videoId || (videoId === null || videoId === void 0 ? void 0 : videoId.trim()) === "") {
        throw new ApiError_1.default(400, "Invalid Video Id");
    }
    try {
        const updatedVideo = yield video_model_1.Video.findByIdAndUpdate(videoId, [
            {
                $set: {
                    isPublished: {
                        $cond: { if: "$isPublished", then: false, else: true },
                    },
                },
            },
        ], { new: true });
        if (!updatedVideo) {
            throw new ApiError_1.default(404, "Video not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedVideo, "Video Publish Status Toggled"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not toggle publish status - " + error);
    }
}));
exports.togglePublishStatus = togglePublishStatus;
