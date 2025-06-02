"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria-simulation";
class DatabaseConnection {
    constructor() {
        this.connectionState = false;
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        try {
            if (this.connectionState) {
                console.log("Database already connected");
                return;
            }
            await mongoose_1.default.connect(MONGODB_URI);
            this.connectionState = true;
            console.log("Successfully connected to MongoDB");
            // Handle connection events
            mongoose_1.default.connection.on("disconnected", () => {
                console.log("MongoDB disconnected");
                this.connectionState = false;
            });
            mongoose_1.default.connection.on("error", (error) => {
                console.error("MongoDB connection error:", error);
                this.connectionState = false;
            });
            mongoose_1.default.connection.on("reconnected", () => {
                console.log("MongoDB reconnected");
                this.connectionState = true;
            });
        }
        catch (error) {
            console.error("Failed to connect to MongoDB:", error);
            this.connectionState = false;
            throw error;
        }
    }
    async disconnect() {
        try {
            if (!this.connectionState) {
                console.log("Database already disconnected");
                return;
            }
            await mongoose_1.default.disconnect();
            this.connectionState = false;
            console.log("Successfully disconnected from MongoDB");
        }
        catch (error) {
            console.error("Failed to disconnect from MongoDB:", error);
            throw error;
        }
    }
    isConnected() {
        return this.connectionState && mongoose_1.default.connection.readyState === 1;
    }
    getConnectionState() {
        const states = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
        };
        return (states[mongoose_1.default.connection.readyState] || "unknown");
    }
}
exports.dbConnection = DatabaseConnection.getInstance();
exports.default = exports.dbConnection;
