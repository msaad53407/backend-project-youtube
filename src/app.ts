import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { jsonLimit } from "./constants";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

export const app = express();

// This option enables preflight requests on all routes for all HTTP methods.
app.options("*", cors());

// Configuring Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);
app.use(express.json({ limit: jsonLimit }));
// This middleware is used for parsing URL-encoded bodies
app.use(express.urlencoded({ limit: jsonLimit, extended: true }));
app.use(express.static("public"));

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

// Importing Routes
import userRouter from "./routes/user.routes";
import videoRouter from "./routes/video.routes";
import commentRouter from "./routes/comment.routes";
import likeRouter from "./routes/like.routes";
import tweetRouter from "./routes/tweet.routes";
import playlistRouter from "./routes/playlist.routes";
import subscriptionRouter from "./routes/subscription.routes";
import dashboardRouter from "./routes/dashboard.routes";
import healthCheck from "./routes/healthcheck.routes";

// Routes Declaration
//& Good and Industry standard practice to use /api/v(whatever the version) before the actual route prefix.
// http://localhost:8000/api/v1/users/register
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/healthcheck", healthCheck);
