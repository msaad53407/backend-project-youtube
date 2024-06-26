import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "../utils/ApiError";

cloudinary.config({
  //TODO: change this to env variables
  cloud_name: "dtpfadzih",
  api_key: "737133615345273",
  api_secret: "5CsXKDv9RSxixdHM5AH6YDHmg_c",
});

export const uploadFile = async (filePath: string) => {
  if (!filePath) return null;
  try {
    const response = await cloudinary.uploader.upload(filePath, {
      unique_filename: true,
      resource_type: "auto",
      folder: "streamNow",
    });
    fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    try {
      fs.unlinkSync(filePath);
    } catch (_) {
      return null;
    }
    throw new ApiError(500, "Error uploading file to Cloudinary !!! " + error);
  }
};

export const deleteFile = async (
  publicId: string,
  resourceType: "raw" | "image" | "video"
) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  } catch (error) {
    throw new ApiError(500, "Error deleting file from Cloudinary !!! " + error);
  }
};
