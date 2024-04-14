import mongoose from "mongoose";
import { LikeDocument, LikeModel, LikeSchema } from "../interfaces/mongoose.gen";

const likeSchema: LikeSchema = new mongoose.Schema({
    likedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    video: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Video",
    },
    comment: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Comment",
    },
    tweet: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Tweet",
    }
}, { timestamps: true });

export const Like: LikeModel = mongoose.model<LikeDocument, LikeModel>("Like", likeSchema)