"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/stats").get(dashboard_controller_1.getChannelStats);
router.route("/videos").get(dashboard_controller_1.getChannelVideos);
exports.default = router;
