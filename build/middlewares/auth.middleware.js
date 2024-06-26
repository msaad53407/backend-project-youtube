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
exports.verifyJWT = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const user_model_1 = require("../models/user.model");
exports.verifyJWT = (0, asyncHandler_1.asyncHandler)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const accessToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) ||
            ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        if (!accessToken) {
            throw new ApiError_1.default(401, "Unauthorized Request");
        }
        const userInfoFromToken = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.User.findById(userInfoFromToken === null || userInfoFromToken === void 0 ? void 0 : userInfoFromToken._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError_1.default(401, "Invalid Access Token");
        }
        req.user = user;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Invalid Access Token";
        throw new ApiError_1.default(401, message);
    }
    next();
}));
