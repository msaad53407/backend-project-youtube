import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "../utils/ApiError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
