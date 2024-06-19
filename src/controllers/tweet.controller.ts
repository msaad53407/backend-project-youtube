import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ExtendedRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";

const createTweet = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { tweetContent } = req.body;
    const userId = req.user._id;

    if (!tweetContent || tweetContent.trim() === "") {
      throw new ApiError(401, "Post Content is required");
    }

    try {
      const newTweet = await Tweet.create({
        content: tweetContent,
        owner: userId,
      });

      if (!newTweet) {
        throw new ApiError(500, "Post could not be created");
      }

      return res
        .status(201)
        .json(new ApiResponse(201, newTweet, "Post created Successfully"));
    } catch (error) {
      throw new ApiError(500, "Post could not be created - " + error);
    }
  }
);

const getUserTweets = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || userId.trim() === "" || !isValidObjectId(userId)) {
    throw new ApiError(401, "User Id is required");
  }

  try {
    const tweets = await Tweet.find({
      owner: userId,
    }).exec();

    if (!tweets || tweets.length === 0) {
      throw new ApiError(401, "No Posts found for the given User");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "Posts fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, "Posts could not be fetched - " + error);
  }
});

const updateTweet = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { tweetId } = req.params;

    if (!tweetId || tweetId.trim() === "" || !isValidObjectId(tweetId)) {
      throw new ApiError(401, "Post Id is Required");
    }

    const { updatedPostContent } = req.body;

    if (!updatedPostContent || updatedPostContent.trim() === "") {
      throw new ApiError(401, "Post content is required to update it");
    }

    try {
      const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
          $set: {
            content: updatedPostContent,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedTweet) {
        throw new ApiError(401, "No Post found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Post updated Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could ot fetch Post - " + error);
    }
  }
);

const deleteTweet = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { tweetId } = req.params;

    if (!tweetId || tweetId.trim() === "" || !isValidObjectId(tweetId)) {
      throw new ApiError(400, "Tweet Id is required.");
    }

    try {
      const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

      if (!deletedTweet) {
        throw new ApiError(500, "Post could not be deleted");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Post deleted Successfully"));
    } catch (error) {
      throw new ApiError(500, "Post could not be deleted - " + error);
    }
  }
);

export { createTweet, getUserTweets, updateTweet, deleteTweet };
