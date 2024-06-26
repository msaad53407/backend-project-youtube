"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Like = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const likeSchema = new mongoose_1.default.Schema({
    likedBy: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    video: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "Video",
    },
    comment: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "Comment",
    },
    tweet: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "Tweet",
    }
}, { timestamps: true });
exports.Like = mongoose_1.default.model("Like", likeSchema);
