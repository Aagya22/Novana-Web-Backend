import dotenv from 'dotenv';
dotenv.config();


export const PORT: number =
 process.env.PORT ? parseInt(process.env.PORT) : 5050;

 // ensure PORT is a number, and fallback if not found

 // avoid exception if env is missing 

export const MONGO_URI: string =
process.env.MONGO_URI || 'mongodb://localhost:27017/35c_database';
export const JWT_SECRET: string =
process.env.JWT_SECRET || 'default_secret';

// fallback to local mongo db if env variable is missing

// application level CONSTANTS