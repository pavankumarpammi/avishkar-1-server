import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const MONGO_URI =
        process.env.NODE_ENV === "production"
          ? `mongodb+srv://${process.env.MONGO_URI_PROD}`
          : process.env.MONGO_URI_LOCAL;
  
        await mongoose.connect(MONGO_URI);        
      console.log('MongoDB Connected');
    } catch (error) {
        console.log("error occured", error); 
    }
}
export default connectDB;