import mongoose from "mongoose";

const connectDB = async () => {
    const PROD_DB = process.env.MONGO_URI_PROD
    const DEV_DB = process.env.MONGO_URI_DEV;
    try {
        const conn = await mongoose.connect(process.env.NODE_ENV === 'development' ? DEV_DB : PROD_DB);
        console.log(`MongoDB connected ${conn.connection.host}`);

    } catch (error) {
        console.log("Error is ", error)
        process.exit(1)
    }
};

export default connectDB;