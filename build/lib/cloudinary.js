"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!filePath)
        return null;
    try {
        const response = yield cloudinary_1.v2.uploader.upload(filePath, {
            unique_filename: true,
            resource_type: "auto",
            folder: "streamNow",
        });
        fs_1.default.unlinkSync(filePath);
        return response;
    }
    catch (error) {
        try {
            fs_1.default.unlinkSync(filePath);
        }
        catch (_) {
            return null;
        }
        throw new ApiError_1.default(500, "Error uploading file to Cloudinary !!! " + error);
    }
});
exports.uploadFile = uploadFile;
const deleteFile = (publicId, resourceType) => __awaiter(void 0, void 0, void 0, function* () {
    if (!publicId)
        return;
    try {
        yield cloudinary_1.v2.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true,
        });
    }
    catch (error) {
        throw new ApiError_1.default(500, "Error deleting file from Cloudinary !!! " + error);
    }
});
exports.deleteFile = deleteFile;
