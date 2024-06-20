import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Response } from "express";
import { ExtendedRequest } from "../middlewares/auth.middleware";

const toggleVideoLike = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId) || videoId.trim() === "") {
      throw new ApiError(400, "Video Id is required.");
    }

    const userId = req.user._id;

    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(400, "Unauthorized Request");
    }

    try {
      const deletedVideoLike = await Like.findOneAndDelete({
        video: videoId,
        likedBy: userId,
      });

      if (deletedVideoLike) {
        return res
          .status(200)
          .json(new ApiResponse(200, null, "Unliked Video Successfully"));
      }

      const newLike = await Like.create({
        video: videoId,
        likedBy: userId,
      });

      if (!newLike) {
        throw new ApiError(500, "Could not like Video");
      }

      return res
        .status(201)
        .json(new ApiResponse(201, null, "Liked Video Successfully"));
    } catch (error) {
      throw new ApiError(500, "Internal Server Error");
    }
  }
);

const toggleCommentLike = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { commentId } = req.params;

    if (!commentId || !isValidObjectId(commentId) || commentId.trim() === "") {
      throw new ApiError(400, "Comment Id is required.");
    }

    const userId = req.user._id;

    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(400, "Unauthorized Request");
    }

    try {
      const deletedCommentLike = await Like.findOneAndDelete({
        comment: commentId,
        likedBy: userId,
      });

      if (deletedCommentLike) {
        return res
          .status(200)
          .json(new ApiResponse(200, null, "Unliked Comment Successfully"));
      }

      const newLike = await Like.create({
        comment: commentId,
        likedBy: userId,
      });

      if (!newLike) {
        throw new ApiError(500, "Could not like Comment");
      }

      return res
        .status(201)
        .json(new ApiResponse(201, null, "Liked Comment Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could not toggle Comment like - " + error);
    }
  }
);

const toggleTweetLike = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId) || tweetId.trim() === "") {
      throw new ApiError(400, "Post Id is required.");
    }

    const userId = req.user._id;

    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(400, "Unauthorized Request");
    }

    try {
      const deletedTweetLike = await Like.findOneAndDelete({
        tweet: tweetId,
        likedBy: userId,
      });

      if (deletedTweetLike) {
        return res
          .status(200)
          .json(new ApiResponse(200, null, "Unliked Post Successfully"));
      }

      const newLike = await Like.create({
        tweet: tweetId,
        likedBy: userId,
      });

      if (!newLike) {
        throw new ApiError(500, "Could not like Post");
      }

      return res
        .status(201)
        .json(new ApiResponse(201, null, "Liked Post Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could not toggle Post like - " + error);
    }
  }
);

const getLikedVideos = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const userId = req.user._id;

    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(400, "Unauthorized Request");
    }

    try {
      const likedVideos = await Like.find({
        likedBy: userId,
        $and: [
          {
            tweet: null,
          },
          {
            comment: null,
          },
        ],
      });

      if (!likedVideos || likedVideos.length === 0) {
        throw new ApiError(500, "No Liked Videos");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            likedVideos,
            "Liked videos fetched Successfully."
          )
        );
    } catch (error) {
      throw new ApiError(500, "Could not fetch liked videos - " + error);
    }
  }
);

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
