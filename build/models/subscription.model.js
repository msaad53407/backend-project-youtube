"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SubscriptionSchema = new mongoose_1.default.Schema({
    subscriber: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
    channel: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
exports.Subscription = mongoose_1.default.model("Subscription", SubscriptionSchema);
