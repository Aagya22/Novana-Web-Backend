import { connectDatabaseTest } from "../database/mongodb";
import mongoose from "mongoose";

beforeAll(async () => {
    await connectDatabaseTest();
});

beforeEach(async () => {
    if (!mongoose.connection.db) return;

    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});