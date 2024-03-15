import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`);
        console.log(`MongoDB connected at host: ${connection.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection FAILED', error);
        process.exit(1);
    }
}
