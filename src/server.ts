import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnection from "./utils/db";
import simulationRoutes from "./routes/simulation.routes";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/validation.middleware";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Bacteria Simulation API is running",
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnection.isConnected(),
      state: dbConnection.getConnectionState(),
    },
  });
});

// API Routes
app.use("/api/simulations", simulationRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", notFoundHandler);

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT. Shutting down gracefully...");
  try {
    await dbConnection.disconnect();
    console.log("✅ Database disconnected successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM. Shutting down gracefully...");
  try {
    await dbConnection.disconnect();
    console.log("✅ Database disconnected successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Start server
const startServer = async () => {
  try {
    console.log("🔗 Connecting to database...");
    await dbConnection.connect();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `🧬 Simulation endpoints: http://localhost:${PORT}/api/simulations`
      );
      console.log(`💾 Database: ${dbConnection.getConnectionState()}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
