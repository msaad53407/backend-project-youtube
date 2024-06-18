import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model"
import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { ExtendedRequest } from "../middlewares/auth.middleware"
import { Request, Response } from "express"


const createPlaylist = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { name, description } = req.body

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { userId } = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req: Request, res: Response) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { playlistId, videoId } = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { playlistId } = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req: ExtendedRequest, res: Response) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}