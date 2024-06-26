"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.route("/:videoId").get(comment_controller_1.getVideoComments).post(auth_middleware_1.verifyJWT, comment_controller_1.addComment);
router
    .route("/c/:commentId")
    .delete(auth_middleware_1.verifyJWT, comment_controller_1.deleteComment)
    .patch(auth_middleware_1.verifyJWT, comment_controller_1.updateComment);
exports.default = router;
