import mongoose from "mongoose";
import { TweetDocument, TweetModel, TweetSchema } from "../interfaces/mongoose.gen";

const tweetSchema: TweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Tweet: TweetModel = mongoose.model<TweetDocument, TweetModel>("Tweet", tweetSchema)