import mongoose from "mongoose";
import { config } from "./appConfig";

const ConnectDatabase = async()=>{
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to Mongo database");
    } catch (error) { 
        console.log("Error connecting to Mongo database");
        process.exit(1);
    }
}

export default ConnectDatabase;