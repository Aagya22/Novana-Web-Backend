import { PORT } from "./config";
import { connectDB as connectdb } from "./database/mongodb";
import { app } from "./app";

async function startServer() {
    await connectdb();
    app.listen(PORT, () => {
        console.log(`Server is running: http://localhost:${PORT}`);
    });
}

startServer();