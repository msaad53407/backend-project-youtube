import mongoose from "mongoose";
import { CommentDocument, CommentModel, CommentSchema } from "../interfaces/mongoose.gen";

const commentSchema: CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Video",
        required: true
    },
    //TODO Add Comment support in tweet replies as well.
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Comment: CommentModel = mongoose.model<CommentDocument, CommentModel>("Comment", commentSchema)