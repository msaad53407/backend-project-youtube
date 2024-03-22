import dotenv from "dotenv";
import { connectDB } from "./db";
import { app } from "./app";

dotenv.config({ path: './.env.local' })

const PORT = process.env.PORT || 3001;

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

