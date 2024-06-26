"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyJWT); // Apply verifyJWT middleware to all routes in this file
router
    .route("/c/:channelId")
    .get(subscription_controller_1.getUserChannelSubscribers)
    .post(subscription_controller_1.toggleSubscription);
router.route("/u/:subscriberId").get(subscription_controller_1.getSubscribedChannels);
exports.default = router;
