"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const like_controller_1 = require("../controllers/like.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/toggle/v/:videoId").post(like_controller_1.toggleVideoLike);
router.route("/toggle/c/:commentId").post(like_controller_1.toggleCommentLike);
router.route("/toggle/t/:tweetId").post(like_controller_1.toggleTweetLike);
router.route("/videos").get(like_controller_1.getLikedVideos);
exports.default = router;
