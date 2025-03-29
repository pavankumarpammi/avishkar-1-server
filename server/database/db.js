import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const MONGO_URI =process.env.MONGO_URI
        await mongoose.connect(MONGO_URI);
      console.log('MongoDB Connected');
    } catch (error) {
        console.log("error occured", error); 
    }
}
export default connectDB;