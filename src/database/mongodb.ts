import mongoose from 'mongoose';
import { MONGO_URI } from '../config/index';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

function appendSuffixBeforeQuery(uri: string, suffix: string) {
    const queryIndex = uri.indexOf("?");
    if (queryIndex === -1) return `${uri}${suffix}`;
    return `${uri.slice(0, queryIndex)}${suffix}${uri.slice(queryIndex)}`;
}

export async function connectDatabaseTest() {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        const workerId = process.env.JEST_WORKER_ID ?? "0";
        const testMongoUri = appendSuffixBeforeQuery(MONGO_URI, `_test_${workerId}`);

        await mongoose.connect(testMongoUri);
        console.log(`Connected to MongoDB (test worker ${workerId})`);
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1); // Exit process with failure
    }
}