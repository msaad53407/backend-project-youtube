"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const videoSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number, // This duration will come from Cloudinary or any other 3rd party provider.
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        immutable: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    videoFile: {
        type: String,
        required: true,
    },
    //TODO: For Future QOL Additions.
    // likes: {
    //     type: Number,
    //     default: 0,
    // },
    // dislikes: {
    //     type: Number,
    //     default: 0,
    // }
}, { timestamps: true });
//TODO look into this error later.
//@ts-expect-error Incompatible Types
videoSchema.plugin(mongoose_aggregate_paginate_v2_1.default);
exports.Video = mongoose_1.default.model("Video", videoSchema);
