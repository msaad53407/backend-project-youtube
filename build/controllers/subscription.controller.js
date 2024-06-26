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
exports.getSubscribedChannels = exports.getUserChannelSubscribers = exports.toggleSubscription = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("../models/user.model");
const subscription_model_1 = require("../models/subscription.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const asyncHandler_1 = require("../utils/asyncHandler");
const toggleSubscription = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channelId } = req.params;
    if (!channelId || !(0, mongoose_1.isValidObjectId)(channelId) || channelId.trim() === "") {
        throw new ApiError_1.default(400, "Invalid Channel Id");
    }
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError_1.default(401, "Unauthorized request");
    }
    if (userId.toString() === channelId) {
        throw new ApiError_1.default(403, "Cannot subscribe to Yourself");
    }
    try {
        const userSubscription = yield subscription_model_1.Subscription.findOneAndDelete({
            channel: channelId,
            subscriber: userId,
        });
        if (userSubscription) {
            return res
                .status(200)
                .json(new ApiResponse_1.default(200, null, "Unsubscribed Successfully"));
        }
        const newSubscription = yield subscription_model_1.Subscription.create({
            channel: channelId,
            subscriber: userId,
        });
        if (!newSubscription) {
            throw new ApiError_1.default(502, "Could not subscribe");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, null, "Subscribed Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not toggle subscription - " + error);
    }
}));
exports.toggleSubscription = toggleSubscription;
// controller to return subscriber list of a channel
const getUserChannelSubscribers = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channelId } = req.params;
    // I have been given a channel Id whose subscribers I have to fetch.
    // subscribers are actually users that I have to fetch.
    // I have to make a query on Subscription model, such that only those subscription documents are returned that have channel id matching to given channel id;
    // Next, the count of subscriber field in each document is actually the number of subscribers.
    if (!channelId || !(0, mongoose_1.isValidObjectId)(channelId) || channelId.trim() === "") {
        throw new ApiError_1.default(400, "Invalid Channel Id");
    }
    try {
        const subscriptionsArray = yield subscription_model_1.Subscription.find({
            channel: channelId,
        }).exec();
        if (!subscriptionsArray || subscriptionsArray.length === 0) {
            throw new ApiError_1.default(401, "No Subscribers Found");
        }
        const subscribers = yield user_model_1.User.find({
            _id: {
                $in: subscriptionsArray.map((subscription) => subscription.subscriber),
            },
        }).select("-password -refreshToken -watchHistory");
        if (!subscribers || subscribers.length === 0) {
            throw new ApiError_1.default(401, "No Subscribers found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, subscribers, "Subscribers Fetched Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not fetch Subscribers - " + error);
    }
}));
exports.getUserChannelSubscribers = getUserChannelSubscribers;
// controller to return channel list to which user has subscribed - UPDATE below mentioned subscriberId is actually the user whose subscriptions are to be fetched.
const getSubscribedChannels = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subscriberId } = req.params;
    if (!subscriberId ||
        !(0, mongoose_1.isValidObjectId)(subscriberId) ||
        subscriberId.trim() === "") {
        throw new ApiError_1.default(400, "Invalid Channel Id");
    }
    try {
        const subscriptionsArray = yield subscription_model_1.Subscription.find({
            subscriber: subscriberId,
        }).exec();
        if (!subscriptionsArray || subscriptionsArray.length === 0) {
            throw new ApiError_1.default(401, "No Subscribed Channels Found");
        }
        const channels = yield user_model_1.User.find({
            _id: {
                $in: subscriptionsArray.map((subscription) => subscription.channel),
            },
        }).select("-password -refreshToken -watchHistory");
        if (!channels || channels.length === 0) {
            throw new ApiError_1.default(401, "No Subscribed Channels found");
        }
        return res
            .status(200)
            .json(new ApiResponse_1.default(200, channels, "Subscribed Channels Fetched Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Could not fetch Subscribed Channels - " + error);
    }
}));
exports.getSubscribedChannels = getSubscribedChannels;
