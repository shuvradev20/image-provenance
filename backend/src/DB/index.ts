import mongoose from "mongoose";
import { DB_NAME } from "../constants/constants.js";

// --- Database Connection ---

/**
 * @function connectDB
 * @description Establishes a connection with the MongoDB database using Mongoose.
 * It uses the MONGODB_URI from environment variables and the DB_NAME constant.
 * If the connection fails, the process is terminated to prevent the app from running in an unstable state.
 */
const connectDB = async () => {
    try {
        // Attempting to connect to the database instance
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB host ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MOngoDB connection error", error);
        // Stop the application immediately if the DB connection is not established
        process.exit(1);
    }
}

export {connectDB}