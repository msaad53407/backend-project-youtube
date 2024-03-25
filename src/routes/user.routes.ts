import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerHandler,
} from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerHandler
);
router.route("/login").post(loginUser);

// Secured Routes -> Meaning that these routes require verification before they can be reached.
router.route("/logout").get(verifyJWT, logoutUser);

export default router;
