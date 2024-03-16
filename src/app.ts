import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import { jsonLimit } from "./constants";

export const app = express();

// This option enables preflight requests on all routes for all HTTP methods.
app.options("*", cors());

// Configuring Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: jsonLimit }));
// This middleware is used for parsing URL-encoded bodies
app.use(express.urlencoded({ limit: jsonLimit, extended: true }));
app.use(express.static('public'))

app.use(cookieParser());

