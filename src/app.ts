import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route";
import adminUserRoutes from "./routes/admin/user.route";
import journalRoutes from "./routes/journal.route";
import exerciseRoutes from "./routes/exercise.route";
import moodRoutes from "./routes/mood.route";
import reminderRoutes from "./routes/reminder.route";
import scheduleRoutes from "./routes/schedule.route";

export const app: Application = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3003",
    "http://localhost:5050",
    "http://192.168.1.5:5050",
    "http://10.0.2.2:5050",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Novana API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.use("/api/journals", journalRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/schedules", scheduleRoutes);
