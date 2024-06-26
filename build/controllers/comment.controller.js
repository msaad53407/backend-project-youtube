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
exports.deleteComment = exports.updateComment = exports.addComment = exports.getVideoComments = void 0;
const mongoose_1 = require("mongoose");
const comment_model_1 = require("../models/comment.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const asyncHandler_1 = require("../utils/asyncHandler");
const video_model_1 = require("../models/video.model");
const getVideoComments = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!videoId || !(0, mongoose_1.isValidObjectId)(videoId) || videoId.trim() === "") {
        throw new ApiError_1.default(400, "Invalid Video Id");
    }
    if (!page ||
        !limit ||
        Number(page) <= 0 ||
        Number(limit) <= 0 ||
        isNaN(Number(page)) ||
        isNaN(Number(limit))) {
        throw new ApiError_1.default(400, "Page and Limit are required should be valid numbers");
    }
    try {
        const video = yield video_model_1.Video.findById(videoId);
        if (!video) {
            throw new ApiError_1.default(404, "Video not found");
        }
        const comments = yield comment_model_1.Comment.find({
            video: videoId,
        }, null, {
            skip: (Number(page) - 1) * Number(limit),
            sort: { createdAt: -1 },
            limit: Number(limit),
        });
        if (!comments || comments.length === 0) {
            throw new ApiError_1.default(404, "No Comments found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, comments, "Comments fetched Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not get Comments - " + error);
    }
}));
exports.getVideoComments = getVideoComments;
const addComment = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { videoId } = req.params;
    const { comment } = req.body;
    if (!videoId || !(0, mongoose_1.isValidObjectId)(videoId) || videoId.trim() === "") {
        throw new ApiError_1.default(400, "Invalid Video Id");
    }
    if (!comment || (comment === null || comment === void 0 ? void 0 : comment.trim()) === "") {
        throw new ApiError_1.default(400, "Comment is required");
    }
    const userId = req.user._id;
    if (!userId || !(0, mongoose_1.isValidObjectId)(userId)) {
        throw new ApiError_1.default(400, "Unauthorized Request");
    }
    try {
        const video = yield video_model_1.Video.findById(videoId);
        if (!video) {
            throw new ApiError_1.default(404, "Video not found");
        }
        const newComment = yield comment_model_1.Comment.create({
            owner: userId,
            content: comment,
            video: videoId,
        });
        if (!newComment) {
            throw new ApiError_1.default(500, "Could not add Comment");
        }
        return res
            .status(201)
            .json(new ApiResponse_1.default(201, newComment, "Comment added Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not add comment - " + error);
    }
}));
exports.addComment = addComment;
const updateComment = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!commentId || !(0, mongoose_1.isValidObjectId)(commentId) || (commentId === null || commentId === void 0 ? void 0 : commentId.trim()) === "") {
        throw new ApiError_1.default(400, "Invalid Comment Id");
    }
    if (!content || (content === null || content === void 0 ? void 0 : content.trim()) === "") {
        throw new ApiError_1.default(400, "Comment is required");
    }
    try {
        const updatedComment = yield comment_model_1.Comment.findByIdAndUpdate(commentId, {
            content,
        }, { new: true });
        if (!updatedComment) {
            throw new ApiError_1.default(404, "Comment not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedComment, "Comment updated Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not update Comment - " + error);
    }
}));
exports.updateComment = updateComment;
const deleteComment = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.params;
    if (!commentId || !(0, mongoose_1.isValidObjectId)(commentId) || (commentId === null || commentId === void 0 ? void 0 : commentId.trim()) === "") {
        throw new ApiError_1.default(400, "Invalid Comment Id");
    }
    try {
        const deletedComment = yield comment_model_1.Comment.findByIdAndDelete(commentId);
        if (!deletedComment) {
            throw new ApiError_1.default(404, "Comment not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, null, "Comment deleted Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not delete Comment - " + error);
    }
}));
exports.deleteComment = deleteComment;
