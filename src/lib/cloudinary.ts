import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  //TODO: change this to env variables
  cloud_name: "dqhf5zvl7",
  api_key: "574245544457369",
  api_secret: "goF8dgyrJahzZ3i2SM5k1CiU3E4",
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
    return response.secure_url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary !!!", error);
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
    return null;
  }
};
