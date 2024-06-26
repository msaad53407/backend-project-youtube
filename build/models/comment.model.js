"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true,
    },
    video: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "Video",
        required: true,
    },
    //TODO Add Comment support in tweet replies as well.
    owner: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
exports.Comment = mongoose_1.default.model("Comment", commentSchema);
