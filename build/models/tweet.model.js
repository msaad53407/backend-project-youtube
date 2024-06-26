"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tweet = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tweetSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });
exports.Tweet = mongoose_1.default.model("Tweet", tweetSchema);
