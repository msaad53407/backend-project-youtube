"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const constants_1 = require("./constants");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./.env.local" });
exports.app = (0, express_1.default)();
// This option enables preflight requests on all routes for all HTTP methods.
exports.app.options("*", (0, cors_1.default)());
// Configuring Middlewares
exports.app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
exports.app.use(express_1.default.json({ limit: constants_1.jsonLimit }));
// This middleware is used for parsing URL-encoded bodies
exports.app.use(express_1.default.urlencoded({ limit: constants_1.jsonLimit, extended: true }));
exports.app.use(express_1.default.static("public"));
exports.app.use((0, cookie_parser_1.default)());
// Importing Routes
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const video_routes_1 = __importDefault(require("./routes/video.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const like_routes_1 = __importDefault(require("./routes/like.routes"));
const tweet_routes_1 = __importDefault(require("./routes/tweet.routes"));
const playlist_routes_1 = __importDefault(require("./routes/playlist.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const healthcheck_routes_1 = __importDefault(require("./routes/healthcheck.routes"));
// Routes Declaration
//& Good and Industry standard practice to use /api/v(whatever the version) before the actual route prefix.
// http://localhost:8000/api/v1/users/register
exports.app.use("/api/v1/users", user_routes_1.default);
exports.app.use("/api/v1/videos", video_routes_1.default);
exports.app.use("/api/v1/comments", comment_routes_1.default);
exports.app.use("/api/v1/likes", like_routes_1.default);
exports.app.use("/api/v1/tweets", tweet_routes_1.default);
exports.app.use("/api/v1/playlists", playlist_routes_1.default);
exports.app.use("/api/v1/subscriptions", subscription_routes_1.default);
exports.app.use("/api/v1/dashboard", dashboard_routes_1.default);
exports.app.use("/api/v1/healthcheck", healthcheck_routes_1.default);
