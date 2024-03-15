import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./db";

dotenv.config({ path: './.env.local' })

const app = express();
connectDB();

/*
; (async () => {
  try {
    const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`);
    app.on("error", (error) => {
      console.log("Server could not connect to MongoDB", error);
      throw error;
    })
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
})()
*/

const PORT = process.env.PORT || 3001;

app.get('/',
  (req, res) => res.send('Hello World')
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});