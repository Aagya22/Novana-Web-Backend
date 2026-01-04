import express, { Application, Request, Response } from 'express';
import { connectDB } from './database/mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;  

app.get('/', (req: Request, res: Response) => {
    res.send("Hello World!");
});

async function startServer() {
    await connectDB();  
    app.listen(PORT, () => {
        console.log(`Server on http://localhost:${PORT}`);
    });
}

startServer(); 