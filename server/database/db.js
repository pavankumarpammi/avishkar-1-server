import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.NODE_ENV === 'production' 
        ? process.env.MONGO_URI_PROD 
        : process.env.MONGO_URI_LOCAL;
        if (!MONGO_URI) {
            throw new Error("MongoDB URI is undefined. Check your .env file.");
        }
        console.log("Connecting to MongoDB:", MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.log("error occured", error); 
        process.exit(1);
    }
}

export default connectDB;