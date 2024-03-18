import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (filePath: string) => {
    if (!filePath) return null;
    try {
        const response = await cloudinary.uploader.upload(filePath, {
            upload_preset: "dev_setups",
            unique_filename: true,
            resource_type: "auto",
        });
        fs.unlinkSync(filePath);
        return response.secure_url;
    } catch (error) {
        console.error('Error uploading file to Cloudinary !!!', error);
        try {
            fs.unlinkSync(filePath);
        } catch (_) { }
        return null;
    }
}
