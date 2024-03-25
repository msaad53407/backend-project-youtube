import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import {
  VideoDocument,
  VideoModel,
  VideoSchema,
} from "../interfaces/mongoose.gen";

const videoSchema: VideoSchema = new mongoose.Schema(
  {
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
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

//TODO look into this error later.
// @ts-ignore
videoSchema.plugin(mongooseAggregatePaginate);

export const Video: VideoModel = mongoose.model<VideoDocument, VideoModel>(
  "Video",
  videoSchema
);
