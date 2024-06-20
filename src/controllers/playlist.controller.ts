import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ExtendedRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import { Video } from "../models/video.model";

const createPlaylist = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { name, description } = req.body;

    if (
      [name, description].some(
        (field) => field === undefined || field.trim() === ""
      )
    ) {
      throw new ApiError(400, "Please provide all required fields");
    }

    const userId = req.user._id;

    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(401, "Unauthorized Request");
    }

    try {
      const newPlaylist = await Playlist.create({
        name,
        description,
        owner: userId,
      });

      if (!newPlaylist) {
        throw new ApiError(500, "Could not create Playlist");
      }

      return res
        .status(201)
        .json(
          new ApiResponse(201, newPlaylist, "Playlist created successfully")
        );
    } catch (error) {
      throw new ApiError(500, "Could not create Playlist - " + error);
    }
  }
);

const getUserPlaylists = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { userId } = req.params;
    //TODO: get user playlists

    if (!userId || !isValidObjectId(userId) || userId.trim() === "") {
      throw new ApiError(400, "Invalid User Id");
    }

    try {
      const playlists = await Playlist.find({
        owner: userId,
      });

      if (!playlists || playlists.length === 0) {
        throw new ApiError(400, "No Playlists Found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, playlists, "Playlists fetched Successfully")
        );
    } catch (error) {
      throw new ApiError(500, "Could not get Playlists - " + error);
    }
  }
);

const getPlaylistById = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist Id");
  }

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch Playlist - " + error);
  }
});

const addVideoToPlaylist = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { playlistId, videoId } = req.params;

    if (
      !playlistId ||
      !videoId ||
      !isValidObjectId(playlistId) ||
      !isValidObjectId(videoId)
    ) {
      throw new ApiError(400, "Invalid Playlist Id or Video Id");
    }

    try {
      const videoToPush = await Video.findById(videoId);

      if (!videoToPush) {
        throw new ApiError(404, "Video not Found");
      }

      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $push: { videos: videoId },
        },
        { new: true }
      );

      if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedPlaylist,
            "Video added to playlist successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Could not Add Video to Playlist - " + error);
    }
  }
);

const removeVideoFromPlaylist = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { playlistId, videoId } = req.params;

    if (
      !playlistId ||
      !videoId ||
      !isValidObjectId(playlistId) ||
      !isValidObjectId(videoId)
    ) {
      throw new ApiError(400, "Invalid Playlist Id or Video Id");
    }

    try {
      const videoToPush = await Video.findById(videoId);

      if (!videoToPush) {
        throw new ApiError(404, "Video not Found");
      }

      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $pull: {
            videos: {
              $in: [videoId],
            },
          },
        },
        { new: true }
      );

      if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedPlaylist,
            "Video Removed from Playlist Successfully"
          )
        );
    } catch (error) {
      throw new ApiError(
        500,
        "Could not remove Video from Playlist - " + error
      );
    }
  }
);

const deletePlaylist = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { playlistId } = req.params;

    if (!playlistId || !isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid Playlist Id");
    }

    try {
      const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

      if (!deletedPlaylist) {
        throw new ApiError(400, "Playlist not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted Successfully"));
    } catch (error) {
      throw new ApiError(500, "Could not delete Playlist - " + error);
    }
  }
);

const updatePlaylist = asyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId || !isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid Playlist Id");
    }

    if (
      [name, description].some(
        (field) => field === undefined || field.trim() === ""
      )
    ) {
      throw new ApiError(400, "Please provide all required fields");
    }

    try {
      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          name,
          description,
        },
        { new: true }
      );

      if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
        );
    } catch (error) {
      throw new ApiError(500, "Could not update Playlist - " + error);
    }
  }
);

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
