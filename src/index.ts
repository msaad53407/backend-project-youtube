import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./db";

dotenv.config({ path: './.env.local' })

const PORT = process.env.PORT || 3001;

const app = express();
connectDB().then(() => {
  app.on("error", (error) => {
    console.log("Server could not connect to MongoDB !! ", error);
    throw error;
  })

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

  console.log("MongoDB connected");
}).catch((error) => {
  console.error(`MongoDB connection FAILED !! `, error);
  throw error;
});

app.get('/',
  (req, res) => res.send('Hello World')
);
