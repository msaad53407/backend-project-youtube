import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadFile } from "../lib/cloudinary";
import { Request, Response } from "express";
import { ExtendedRequest } from "../middlewares/auth.middleware";
import { MulterFiles } from "../middlewares/multer.middleware";
import { UploadApiResponse } from "cloudinary";

const getAllVideos = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;

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

  if (
    [query, sortBy, sortType].every(
      (field) => field === undefined || field.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "Please provide all required fields");
  }

  const computedSortType = sortType === "asc" ? 1 : -1;

  try {
    const videos = await Video.find(
      {
        $or: [
          {
            title: { $regex: query, $options: "i" },
          },
          {
            description: { $regex: query, $options: "i" },
          },
        ],

        isPublished: true,
      },
      null,
      {
        skip: (Number(page) - 1) * Number(limit),
        sort: sortBy
          ? { [sortBy.toString()]: computedSortType }
          : { createdAt: -1 },
        limit: Number(limit),
      }
    );

    if (!videos || videos.length === 0) {
      throw new ApiError(404, "No Videos found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, "Could not get Videos - " + error);
  }
});

const publishAVideo = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { title, description } = req.body;

    if (
      [title, description].every(
        (field) => field === undefined || field.trim() === ""
      )
    ) {
      throw new ApiError(400, "Please provide all required fields");
    }

    const userId = req.user._id;

    if (!userId) {
      throw new ApiError(400, "Unauthorized Request");
    }

    const videoLocalPath = (req.files as MulterFiles)?.videoFile[0]?.path;
    const thumbnailLocalPath = (req.files as MulterFiles)?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
      throw new ApiError(400, "Video and thumbnail are required");
    }

    const video = await uploadFile(videoLocalPath);
    const thumbnail = await uploadFile(thumbnailLocalPath);

    try {
      const videoDoc = await Video.create({
        title,
        description,
        videoFile: video?.secure_url,
        thumbnail: thumbnail?.secure_url,
        duration: video?.duration,
        owner: userId,
      });

      if (!videoDoc) {
        throw new ApiError(500, "Could not Publish Video");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, videoDoc, "Video Published Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could not Publish Video - " + error);
    }
  }
);

const getVideoById = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId) || !videoId || videoId?.trim() === "") {
    throw new ApiError(400, "Invalid Video Id");
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(400, "Video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video Fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, "Could not fetch Video - " + error);
  }
});

const updateVideo = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // if (!isValidObjectId(videoId) || !videoId || videoId?.trim() === "") {
    //   throw new ApiError(400, "Invalid Video Id");
    // }

    if (
      [title, description].every(
        (field) => field === undefined || field.trim() === ""
      )
    ) {
      throw new ApiError(400, "Please provide all required fields");
    }

    const userId = req.user._id;

    if (!userId) {
      throw new ApiError(400, "Unauthorized Request");
    }
    const thumbnailLocalPath = (req.files as MulterFiles)?.thumbnail[0]?.path;

    let updatedThumbnail: UploadApiResponse | null = null;
    if (thumbnailLocalPath) {
      updatedThumbnail = await uploadFile(thumbnailLocalPath);
    }

    try {
      const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        [
          {
            $set: {
              title,
              description,
              thumbnail: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: [thumbnailLocalPath, undefined] },
                      { $eq: [thumbnailLocalPath, null] },
                      { $eq: [thumbnailLocalPath, ""] },
                    ],
                  },
                  then: "$thumbnail",
                  else: updatedThumbnail?.secure_url,
                },
              },
            },
          },
        ],
        { new: true }
      );

      if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video Updated Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could not update Video - " + error);
    }
  }
);

const deleteVideo = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId) || !videoId || videoId?.trim() === "") {
      throw new ApiError(400, "Invalid Video Id");
    }

    try {
      const video = await Video.findByIdAndDelete(videoId);

      if (!video) {
        throw new ApiError(400, "Video not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Deleted Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could not delete Video - " + error);
    }
  }
);

const togglePublishStatus = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId) || !videoId || videoId?.trim() === "") {
      throw new ApiError(400, "Invalid Video Id");
    }

    try {
      const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        [
          {
            $set: {
              isPublished: {
                $cond: { if: "$isPublished", then: false, else: true },
              },
            },
          },
        ],
        { new: true }
      );

      if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedVideo, "Video Publish Status Toggled")
        );
    } catch (error) {
      throw new ApiError(500, "Could not toggle publish status - " + error);
    }
  }
);

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
