"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./utils/db"));
const simulation_routes_1 = __importDefault(require("./routes/simulation.routes"));
const validation_middleware_1 = require("./middleware/validation.middleware");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.get("/health", async (req, res) => {
    try {
        await (0, db_1.default)();
        res.status(200).json({
            status: "UP",
            database: {
                connected: mongoose_1.default.connection.readyState === 1,
                state: mongoose_1.default.connection.readyState,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Shutting down server...");
        process.exit(1);
    }
});
// API Routes
app.use("/api/simulations", simulation_routes_1.default);
// Error handling middleware
app.use(validation_middleware_1.errorHandler);
// 404 handler
app.use("*", validation_middleware_1.notFoundHandler);
// Graceful shutdown handling
process.on("SIGINT", async () => {
    console.log("\n🛑 Received SIGINT. Shutting down gracefully...");
    try {
        await mongoose_1.default.disconnect();
        console.log("✅ Database disconnected successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
});
process.on("SIGTERM", async () => {
    console.log("\n🛑 Received SIGTERM. Shutting down gracefully...");
    try {
        await mongoose_1.default.disconnect();
        console.log("✅ Database disconnected successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
});
// Start server
const startServer = async () => {
    try {
        await (0, db_1.default)();
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server is UP and running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`�� Health check: http://localhost:${PORT}/health`);
            console.log(`🧬 Simulation endpoints: http://localhost:${PORT}/api/simulations`);
            console.log(`💾 Database: ${mongoose_1.default.connection.readyState === 1 ? 'Connected' : 'Disconnected'} (State: ${mongoose_1.default.connection.readyState})`);
        });
        // Handle unhandled rejections
        process.on("unhandledRejection", (reason, promise) => {
            console.error("Unhandled Rejection:", reason);
            // Graceful shutdown
            server.close(async () => {
                console.log("Server shut down.");
                try {
                    await mongoose_1.default.disconnect();
                    console.log("MongoDB disconnected due to unhandled rejection.");
                }
                catch (err) {
                    console.error("❌ Error during shutdown:", err);
                }
                process.exit(1);
            });
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
