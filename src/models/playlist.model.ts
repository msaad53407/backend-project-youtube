import mongoose from "mongoose";
import { PlaylistDocument, PlaylistModel, PlaylistSchema } from "../interfaces/mongoose.gen";

const playlistSchema: PlaylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "Video",
        required: true
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Playlist: PlaylistModel = mongoose.model<PlaylistDocument, PlaylistModel>("Playlist", playlistSchema);