"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const playlistSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videos: {
        type: [mongoose_1.default.SchemaTypes.ObjectId],
        ref: "Video",
    },
    owner: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
exports.Playlist = mongoose_1.default.model("Playlist", playlistSchema);
