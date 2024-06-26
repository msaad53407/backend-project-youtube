"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const app_1 = require("./app");
dotenv_1.default.config({ path: "./.env.local" });
const PORT = process.env.PORT || 3001;
(0, db_1.connectDB)()
    .then(() => {
    app_1.app.on("error", (error) => {
        console.log("Server could not connect to MongoDB !! ", error);
        throw error;
    });
    app_1.app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    console.log("MongoDB connected");
})
    .catch((error) => {
    console.error(`MongoDB connection FAILED !! `, error);
    throw error;
});
