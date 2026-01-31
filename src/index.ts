
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
// import cors from 'cors';
import { PORT } from './config';
import authRoutes from './routes/auth.route';
import { connectDB as connectdb } from './database/mongodb';
import cors from 'cors';
import path from 'path';

const app: Application = express();
let corsOptions={
    origin: [
  "http://localhost:3000",
  "http://localhost:3003",
  "http://localhost:5050",
  "http://192.168.1.5:5050",
  "http://10.0.2.2:5050"
],

    credentials: true,
    optionsSuccessStatus: 200
    //list of domains allowed to access the server
}

app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve static files from uploads directory
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