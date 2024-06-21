import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { ExtendedRequest } from "../middlewares/auth.middleware";
import { Video } from "../models/video.model";

const getVideoComments = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId || !isValidObjectId(videoId) || videoId.trim() === "") {
    throw new ApiError(400, "Invalid Video Id");
  }

  if (
    !page ||
    !limit ||
    Number(page) <= 0 ||
    Number(limit) <= 0 ||
    isNaN(Number(page)) ||
    isNaN(Number(limit))
  ) {
    throw new ApiError(
      400,
      "Page and Limit are required should be valid numbers"
    );
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const comments = await Comment.find(
      {
        video: videoId,
      },
      null,
      {
        skip: (Number(page) - 1) * Number(limit),
        sort: { createdAt: -1 },
        limit: Number(limit),
      }
    );

    if (!comments || comments.length === 0) {
      throw new ApiError(404, "No Comments found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, "Could not get Comments - " + error);
  }
});

const addComment = asyncHandler(async (req: ExtendedRequest, res: Response) => {
  const { videoId } = req.params;
  const { comment } = req.body;

  if (!videoId || !isValidObjectId(videoId) || videoId.trim() === "") {
    throw new ApiError(400, "Invalid Video Id");
  }

  if (!comment || comment?.trim() === "") {
    throw new ApiError(400, "Comment is required");
  }

  const userId = req.user._id;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Unauthorized Request");
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const newComment = await Comment.create({
      owner: userId,
      content: comment,
      video: videoId,
    });

    if (!newComment) {
      throw new ApiError(500, "Could not add Comment");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newComment, "Comment added Successfully"));
  } catch (error) {
    throw new ApiError(500, "Could not add comment - " + error);
  }
});

const updateComment = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId || !isValidObjectId(commentId) || commentId?.trim() === "") {
      throw new ApiError(400, "Invalid Comment Id");
    }

    if (!content || content?.trim() === "") {
      throw new ApiError(400, "Comment is required");
    }

    try {
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          content,
        },
        { new: true }
      );

      if (!updatedComment) {
        throw new ApiError(404, "Comment not found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedComment, "Comment updated Successfully")
        );
    } catch (error) {
      throw new ApiError(500, "Could not update Comment - " + error);
    }
  }
);

const deleteComment = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { commentId } = req.params;

    if (!commentId || !isValidObjectId(commentId) || commentId?.trim() === "") {
      throw new ApiError(400, "Invalid Comment Id");
    }

    try {
      const deletedComment = await Comment.findByIdAndDelete(commentId);

      if (!deletedComment) {
        throw new ApiError(404, "Comment not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could not delete Comment - " + error);
    }
  }
);

export { getVideoComments, addComment, updateComment, deleteComment };
