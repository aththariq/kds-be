import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
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
app.get("/health", async (req, res) => {
  try {
    await dbConnection();
    res.status(200).json({
      status: "UP",
      database: {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Shutting down server...");
    process.exit(1);
  }
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
    await mongoose.disconnect();
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
    await mongoose.disconnect();
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
    await dbConnection();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is UP and running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`�� Health check: http://localhost:${PORT}/health`);
      console.log(
        `🧬 Simulation endpoints: http://localhost:${PORT}/api/simulations`
      );
      console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'} (State: ${mongoose.connection.readyState})`);
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection:", reason);
      // Graceful shutdown
      server.close(async () => {
        console.log("Server shut down.");
        try {
          await mongoose.disconnect();
          console.log("MongoDB disconnected due to unhandled rejection.");
        } catch (err) {
          console.error("❌ Error during shutdown:", err);
        }
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
