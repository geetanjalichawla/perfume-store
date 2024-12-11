import app from "./app";
import { connectDB, disconnectDB } from "./config/db.config";
import { errorMiddleware } from "./middlewares/error.middleware";

app.use(errorMiddleware);


// Start the server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});


process.on("SIGINT", async () => {
  console.log("\nShutting down server...");
  await disconnectDB();
  process.exit(0);
});
