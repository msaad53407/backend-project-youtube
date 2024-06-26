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
exports.getWatchHistory = exports.getUserChannelProfile = exports.updateUserCoverImage = exports.updateUserAvatar = exports.updateAccountDetails = exports.getCurrentUser = exports.changeCurrentPassword = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.registerHandler = void 0;
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const asyncHandler_1 = require("../utils/asyncHandler");
const user_model_1 = require("../models/user.model");
const cloudinary_1 = require("../lib/cloudinary");
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const options = {
    httpOnly: true,
    secure: true,
    maxAge: 86400 * 1000 * 1,
};
const registerHandler = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Get details from the body of the request.
    // Step 2: Validate the details coming from client.
    // Step 3: Checking if the user already exists (by username or email). If yes then returning and informing the user that account already exists and they should proceed to Login.
    // Step 4: Validate if required images and avatar is sent from client.
    // Step 5: If provided, then uploading the images and avatar to cloudinary.
    // Step 6: Checking if the avatar (specifically) is successfully uploaded or not.
    // Step 7: If user does not exist then create a new user according to the schema.
    // Step 8a : Returning the newly created user if user is created and sending success message to client. Beware to remove password and refresh token fields from the response object.
    // Step 8b : Sending confirmation email to the user provided email So that the user's account can be activated.
    var _a, _b, _c;
    //Step1
    const { fullName, username, email, password } = req.body;
    //Step2
    if ([fullName, username, email, password].every((field) => field === undefined || field.trim() === "")) {
        throw new ApiError_1.default(400, "Please provide all required fields");
    }
    //Step3
    const user = yield user_model_1.User.findOne({
        $or: [{ username }, { email }],
    });
    if (user) {
        throw new ApiError_1.default(409, "Account already exists with provided email or username.");
    }
    //Step4
    const avatarLocalPath = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.avatar[0]) === null || _b === void 0 ? void 0 : _b.path;
    let coverImageLocalPath = null;
    if (req.files && "coverImage" in req.files) {
        coverImageLocalPath =
            ((_c = req.files.coverImage[0]) === null || _c === void 0 ? void 0 : _c.path) || null;
    }
    if (!avatarLocalPath) {
        throw new ApiError_1.default(400, "Avatar is required.");
    }
    //Step5
    const avatar = yield (0, cloudinary_1.uploadFile)(avatarLocalPath);
    const coverImage = coverImageLocalPath
        ? yield (0, cloudinary_1.uploadFile)(coverImageLocalPath)
        : null;
    //Step6
    if (!(avatar === null || avatar === void 0 ? void 0 : avatar.secure_url)) {
        throw new ApiError_1.default(500, "Error uploading avatar.");
    }
    //Step7
    const registeredUser = yield user_model_1.User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar === null || avatar === void 0 ? void 0 : avatar.secure_url,
        coverImage: (coverImage === null || coverImage === void 0 ? void 0 : coverImage.secure_url) || null,
    });
    // We are querying the newly created user from the db to ensure that User is created. Futhermore, we are removing password and refreshToken fields from the response object by specifying which fields to remove in the select option.
    const responseUser = yield user_model_1.User.findById(registeredUser._id).select("-password -refreshToken");
    if (!responseUser) {
        throw new ApiError_1.default(500, "Error registering user.");
    }
    return res
        .status(201)
        .json(new ApiResponse_1.default(201, responseUser, "User created successfully."));
}));
exports.registerHandler = registerHandler;
const generateAccessAndRefreshToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        yield user.save({
            validateBeforeSave: false, // So that fields are not validated when saved and all changes are directly saved to the db.
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    catch (error) {
        throw new ApiError_1.default(500, "Some Error Occurred while generating Access and Refresh Tokens.");
    }
});
const loginUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Step1 -> Get credentials from user to login.
    //Step2 -> Validate if the given credentials are in correct format.
    //Step3 -> Check if user exists in db according to provided credentials.
    //Step4 -> If user exists, then continue to validate if provided credentials match with the ones in db.
    //Step5 -> If credentials match, then generate 2 tokens, one is Access token and other is Refresh Token.
    //Step6 -> refresh token is stored in db while access token is sent through cookies to the client
    //Step7 -> Return response object with user details.
    const { username, email, password } = req.body;
    if ((!username || username === "") && (!email || email === "")) {
        throw new ApiError_1.default(400, "Username or Email is required.");
    }
    if (!password || password === "") {
        throw new ApiError_1.default(400, "Password is required.");
    }
    const user = yield user_model_1.User.findOne({
        $or: [{ username }, { email }],
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found.");
    }
    const isPasswordValid = yield user.isPasswordValid(password);
    if (!isPasswordValid) {
        throw new ApiError_1.default(401, "Invalid password.");
    }
    const { accessToken, refreshToken } = yield generateAccessAndRefreshToken(user);
    const loggedInUser = yield user_model_1.User.findById(user._id).select("-password -refreshToken");
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, options), { maxAge: 86400 * 1000 * 10 }))
        .json(new ApiResponse_1.default(200, {
        user: loggedInUser,
        accessToken,
        refreshToken, // We are sending these again despite of already setting hem in cookies, bcz maybe if a mobile app user is trying to login, in that case we cannot set cookies. So we send tokens to client so that they can securely store them
    }, "Logged in Successfully."));
}));
exports.loginUser = loginUser;
const logoutUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError_1.default(400, "User Id is required.");
    }
    try {
        const user = yield user_model_1.User.findByIdAndUpdate(userId, {
            $set: {
                refreshToken: undefined,
            },
        }, { new: true }); // Setting new to true will return user doc with updated fields.
        if (!user) {
            throw new ApiError_1.default(404, "User not found.");
        }
    }
    catch (error) {
        throw new ApiError_1.default(500, "Failed to fetch User");
    }
    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse_1.default(200, null, "User Logged out Successfully"));
}));
exports.logoutUser = logoutUser;
const refreshAccessToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const refreshTokenFromUser = ((_d = req.cookies) === null || _d === void 0 ? void 0 : _d.refreshToken) || ((_e = req.body) === null || _e === void 0 ? void 0 : _e.refreshToken);
    if (!refreshTokenFromUser) {
        throw new ApiError_1.default(400, "Unauthorized Request.");
    }
    try {
        const decodedRefreshToken = jsonwebtoken_1.default.verify(refreshTokenFromUser, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.User.findById(decodedRefreshToken === null || decodedRefreshToken === void 0 ? void 0 : decodedRefreshToken._id);
        if (!user || (user === null || user === void 0 ? void 0 : user.refreshToken) !== refreshTokenFromUser) {
            throw new ApiError_1.default(401, "Invalid Refresh Token.");
        }
        const { accessToken, refreshToken } = yield generateAccessAndRefreshToken(user);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, options), { maxAge: 86400 * 1000 * 10 }))
            .json(new ApiResponse_1.default(200, {
            accessToken,
            refreshToken,
        }, "Access Token Refreshed Successfully"));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Invalid RefreshToken";
        throw new ApiError_1.default(500, errorMessage);
    }
}));
exports.refreshAccessToken = refreshAccessToken;
const changeCurrentPassword = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = req.body;
    if ((!oldPassword || oldPassword === "") &&
        (!newPassword || newPassword === "")) {
        throw new ApiError_1.default(400, "Old Password and New Password are required.");
    }
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError_1.default(400, "User Id is required.");
    }
    try {
        const user = yield user_model_1.User.findById(userId);
        const isPasswordValid = yield (user === null || user === void 0 ? void 0 : user.isPasswordValid(oldPassword));
        if (!isPasswordValid) {
            //TODO Check as to why this Api error is not being thrown
            throw new ApiError_1.default(400, "Password is incorrect.");
        }
        user === null || user === void 0 ? void 0 : user.set("password", newPassword);
        yield (user === null || user === void 0 ? void 0 : user.save({ validateBeforeSave: false }));
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, null, "Password Changed Successfully."));
    }
    catch (error) {
        return new ApiError_1.default(500, "Failed to fetch User.");
    }
}));
exports.changeCurrentPassword = changeCurrentPassword;
// TODO Add a forgot password controller for a future forgot password functionality.
const getCurrentUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        throw new ApiError_1.default(400, "User Id is required.");
    }
    return res
        .status(200)
        .json(new ApiResponse_1.default(200, user, "User fetched successfully."));
}));
exports.getCurrentUser = getCurrentUser;
const updateAccountDetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email } = req.body;
    if ([fullName, email].some((field) => field === undefined || field === "")) {
        throw new ApiError_1.default(400, "Full Name and Email are required.");
    }
    const userId = req.user._id;
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, {
        $set: { fullName, email },
    }, { new: true }).select("-password"); // -password means that password will not be returned in the updatedUser object.
    if (!updatedUser) {
        throw new ApiError_1.default(404, "User not found.");
    }
    return res
        .status(200)
        .json(new ApiResponse_1.default(200, updatedUser, "Account Details Updated Successfully."));
}));
exports.updateAccountDetails = updateAccountDetails;
const updateUserCoverImage = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const userId = req.user._id;
    const coverImageLocalPath = ((_f = req === null || req === void 0 ? void 0 : req.file) === null || _f === void 0 ? void 0 : _f.path) || null;
    if (!coverImageLocalPath) {
        throw new ApiError_1.default(400, "Cover Image is required.");
    }
    const coverImageUrl = yield (0, cloudinary_1.uploadFile)(coverImageLocalPath);
    if (!coverImageUrl) {
        throw new ApiError_1.default(401, "Failed to update Cover Image.");
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, {
        $set: { coverImage: coverImageUrl },
    }, { new: true }).select("-password"); // -password means that password will not be returned in the updatedUser object.
    if (!updatedUser) {
        throw new ApiError_1.default(404, "User not found.");
    }
    return res
        .status(200)
        .json(new ApiResponse_1.default(200, updatedUser, "Cover Image Updated Successfully."));
}));
exports.updateUserCoverImage = updateUserCoverImage;
const updateUserAvatar = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const userId = req.user._id;
    const avatarLocalPath = ((_g = req.file) === null || _g === void 0 ? void 0 : _g.path) || null;
    if (!avatarLocalPath) {
        throw new ApiError_1.default(400, "Avatar is required.");
    }
    const avatarUrl = yield (0, cloudinary_1.uploadFile)(avatarLocalPath);
    if (!avatarUrl) {
        throw new ApiError_1.default(401, "Failed to update avatar.");
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, {
        $set: { avatar: avatarUrl },
    }, { new: true }).select("-password"); // -password means that password will not be returned in the updatedUser object.
    if (!updatedUser) {
        throw new ApiError_1.default(404, "User not found.");
    }
    return res
        .status(200)
        .json(new ApiResponse_1.default(200, updatedUser, "Avatar Updated Successfully."));
}));
exports.updateUserAvatar = updateUserAvatar;
const getUserChannelProfile = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const { username } = req.params;
    if (!(username === null || username === void 0 ? void 0 : username.trim()) || username === "") {
        throw new ApiError_1.default(400, "Username is required.");
    }
    try {
        const channel = yield user_model_1.User.aggregate([
            {
                $match: {
                    username,
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo",
                },
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    subscribedToCount: { $size: "$subscribedTo" },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [(_h = req.user) === null || _h === void 0 ? void 0 : _h._id, "$subscribers.subscriber"],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    fullName: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1, // TODO Research about a way to add a conditional statement here So that the isSubscribed field gets projected only if username !== req.user.username
                    username: 1,
                    email: 1,
                },
            },
        ]);
        if (!channel || channel.length === 0) {
            throw new ApiError_1.default(404, "Channel not found.");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, channel[0], "Channel fetched Successfully."));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Failed to fetch User.");
    }
}));
exports.getUserChannelProfile = getUserChannelProfile;
const getWatchHistory = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const userId = new mongoose_1.default.Types.ObjectId(req.user._id);
    const watchHistory = yield user_model_1.User.aggregate([
        {
            $match: {
                _id: userId,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" },
                        },
                    },
                ],
            },
        },
    ]);
    if (!watchHistory || watchHistory.length === 0) {
        throw new ApiError_1.default(404, "No watch history found.");
    }
    return res
        .status(200)
        .json(new ApiResponse_1.default(200, (_j = watchHistory[0]) === null || _j === void 0 ? void 0 : _j.watchHistory, "Watch History fetched Successfully."));
}));
exports.getWatchHistory = getWatchHistory;
