"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./utils/db"));
const simulation_routes_1 = __importDefault(require("./routes/simulation.routes"));
const validation_middleware_1 = require("./middleware/validation.middleware");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Bacteria Simulation API is running",
        timestamp: new Date().toISOString(),
        database: {
            connected: db_1.default.isConnected(),
            state: db_1.default.getConnectionState(),
        },
    });
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
        await db_1.default.disconnect();
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
        await db_1.default.disconnect();
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
        console.log("🔗 Connecting to database...");
        await db_1.default.connect();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🧬 Simulation endpoints: http://localhost:${PORT}/api/simulations`);
            console.log(`💾 Database: ${db_1.default.getConnectionState()}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
