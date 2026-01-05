
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
// import cors from 'cors';
import { PORT } from './config';
import authRoutes from './routes/auth.route';
import { connectDB as connectdb } from './database/mongodb';

const app: Application = express();


// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Novana API is running!' });
});

// Auth routes
app.use('/api/auth', authRoutes);

async function startServer() {
    await connectdb();
    app.listen(PORT, () => {
        console.log(`Server is running: http://localhost:${PORT}`);
    });
}

startServer();