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
exports.updatePlaylist = exports.deletePlaylist = exports.removeVideoFromPlaylist = exports.addVideoToPlaylist = exports.getPlaylistById = exports.getUserPlaylists = exports.createPlaylist = void 0;
const mongoose_1 = require("mongoose");
const playlist_model_1 = require("../models/playlist.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const asyncHandler_1 = require("../utils/asyncHandler");
const video_model_1 = require("../models/video.model");
const createPlaylist = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    if ([name, description].some((field) => field === undefined || field.trim() === "")) {
        throw new ApiError_1.default(400, "Please provide all required fields");
    }
    const userId = req.user._id;
    if (!userId || !(0, mongoose_1.isValidObjectId)(userId)) {
        throw new ApiError_1.default(401, "Unauthorized Request");
    }
    try {
        const newPlaylist = yield playlist_model_1.Playlist.create({
            name,
            description,
            owner: userId,
        });
        if (!newPlaylist) {
            throw new ApiError_1.default(500, "Could not create Playlist");
        }
        return res
            .status(201)
            .json(new ApiResponse_1.default(201, newPlaylist, "Playlist created successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not create Playlist - " + error);
    }
}));
exports.createPlaylist = createPlaylist;
const getUserPlaylists = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    //TODO: get user playlists
    if (!userId || !(0, mongoose_1.isValidObjectId)(userId) || userId.trim() === "") {
        throw new ApiError_1.default(400, "Invalid User Id");
    }
    try {
        const playlists = yield playlist_model_1.Playlist.find({
            owner: userId,
        });
        if (!playlists || playlists.length === 0) {
            throw new ApiError_1.default(400, "No Playlists Found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, playlists, "Playlists fetched Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not get Playlists - " + error);
    }
}));
exports.getUserPlaylists = getUserPlaylists;
const getPlaylistById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId } = req.params;
    if (!playlistId || !(0, mongoose_1.isValidObjectId)(playlistId)) {
        throw new ApiError_1.default(400, "Invalid Playlist Id");
    }
    try {
        const playlist = yield playlist_model_1.Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError_1.default(404, "Playlist not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, playlist, "Playlist fetched Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Failed to fetch Playlist - " + error);
    }
}));
exports.getPlaylistById = getPlaylistById;
const addVideoToPlaylist = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId, videoId } = req.params;
    if (!playlistId ||
        !videoId ||
        !(0, mongoose_1.isValidObjectId)(playlistId) ||
        !(0, mongoose_1.isValidObjectId)(videoId)) {
        throw new ApiError_1.default(400, "Invalid Playlist Id or Video Id");
    }
    try {
        const videoToPush = yield video_model_1.Video.findById(videoId);
        if (!videoToPush) {
            throw new ApiError_1.default(404, "Video not Found");
        }
        const updatedPlaylist = yield playlist_model_1.Playlist.findByIdAndUpdate(playlistId, {
            $push: { videos: videoId },
        }, { new: true });
        if (!updatedPlaylist) {
            throw new ApiError_1.default(404, "Playlist not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedPlaylist, "Video added to playlist successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not Add Video to Playlist - " + error);
    }
}));
exports.addVideoToPlaylist = addVideoToPlaylist;
const removeVideoFromPlaylist = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId, videoId } = req.params;
    if (!playlistId ||
        !videoId ||
        !(0, mongoose_1.isValidObjectId)(playlistId) ||
        !(0, mongoose_1.isValidObjectId)(videoId)) {
        throw new ApiError_1.default(400, "Invalid Playlist Id or Video Id");
    }
    try {
        const videoToPush = yield video_model_1.Video.findById(videoId);
        if (!videoToPush) {
            throw new ApiError_1.default(404, "Video not Found");
        }
        const updatedPlaylist = yield playlist_model_1.Playlist.findByIdAndUpdate(playlistId, {
            $pull: {
                videos: {
                    $in: [videoId],
                },
            },
        }, { new: true });
        if (!updatedPlaylist) {
            throw new ApiError_1.default(404, "Playlist not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedPlaylist, "Video Removed from Playlist Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not remove Video from Playlist - " + error);
    }
}));
exports.removeVideoFromPlaylist = removeVideoFromPlaylist;
const deletePlaylist = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId } = req.params;
    if (!playlistId || !(0, mongoose_1.isValidObjectId)(playlistId)) {
        throw new ApiError_1.default(400, "Invalid Playlist Id");
    }
    try {
        const deletedPlaylist = yield playlist_model_1.Playlist.findByIdAndDelete(playlistId);
        if (!deletedPlaylist) {
            throw new ApiError_1.default(400, "Playlist not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, null, "Playlist deleted Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not delete Playlist - " + error);
    }
}));
exports.deletePlaylist = deletePlaylist;
const updatePlaylist = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!playlistId || !(0, mongoose_1.isValidObjectId)(playlistId)) {
        throw new ApiError_1.default(400, "Invalid Playlist Id");
    }
    if ([name, description].some((field) => field === undefined || field.trim() === "")) {
        throw new ApiError_1.default(400, "Please provide all required fields");
    }
    try {
        const updatedPlaylist = yield playlist_model_1.Playlist.findByIdAndUpdate(playlistId, {
            name,
            description,
        }, { new: true });
        if (!updatedPlaylist) {
            throw new ApiError_1.default(404, "Playlist not found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedPlaylist, "Playlist updated successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not update Playlist - " + error);
    }
}));
exports.updatePlaylist = updatePlaylist;
