import mongoose from "mongoose";
import { MONGO_URI } from "../config";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoTestServer: MongoMemoryServer | null = null;

export async function connectDatabase(){
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1); // Exit process with failure
    }
}


export async function connectDatabaseTest(){
    try {
        if (mongoTestServer) {
            // already started
            return;
        }

        mongoTestServer = await MongoMemoryServer.create();
        const uri = mongoTestServer.getUri();

        await mongoose.connect(uri);
        console.log("Connected to MongoDB (in-memory)");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1); // Exit process with failure
    }
}

export async function disconnectDatabaseTest() {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        if (mongoTestServer) {
            await mongoTestServer.stop();
            mongoTestServer = null;
        }
    } catch (error) {
        console.error("Database disconnect error:", error);
    }
}