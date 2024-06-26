"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.route("/register").post(multer_middleware_1.upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]), user_controller_1.registerHandler);
router.route("/login").post(user_controller_1.loginUser);
router.route("/refresh-token").post(user_controller_1.refreshAccessToken);
// Secured Routes -> Meaning that these routes require verification before they can be reached.
router.route("/logout").post(auth_middleware_1.verifyJWT, user_controller_1.logoutUser);
router.route("/change-password").post(auth_middleware_1.verifyJWT, user_controller_1.changeCurrentPassword);
router.route("/get-user").get(auth_middleware_1.verifyJWT, user_controller_1.getCurrentUser);
router.route("/update-user").patch(auth_middleware_1.verifyJWT, user_controller_1.updateAccountDetails);
router
    .route("/update-avatar")
    .patch(auth_middleware_1.verifyJWT, multer_middleware_1.upload.single("avatar"), user_controller_1.updateUserAvatar);
router
    .route("/update-cover-image")
    .patch(auth_middleware_1.verifyJWT, multer_middleware_1.upload.single("coverImage"), user_controller_1.updateUserCoverImage);
router.route("/channel/:username").get(auth_middleware_1.verifyJWT, user_controller_1.getUserChannelProfile);
router.route("/watch-history").get(auth_middleware_1.verifyJWT, user_controller_1.getWatchHistory);
exports.default = router;
