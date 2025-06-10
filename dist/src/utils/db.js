"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria-simulation";
// Mongoose connection options
const options = {
    // useNewUrlParser: true, // Deprecated, always true
    // useUnifiedTopology: true, // Deprecated, always true
    maxPoolSize: 10, // Maintain up to 10 socket connections
    // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = global.mongoose;
if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cached = global.mongoose = { conn: null, promise: null };
}
async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose_1.default.connect(MONGODB_URI, options).then((mongooseInstance) => {
            console.log('Successfully connected to MongoDB Atlas.');
            return mongooseInstance;
        }).catch(error => {
            console.error('Error connecting to MongoDB Atlas:', error);
            // Ensure the promise rejects on error so callers can catch it
            throw error;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (e) {
        cached.promise = null; // Reset promise on error so next attempt can retry
        throw e; // Re-throw error to be caught by caller
    }
    return cached.conn;
}
exports.default = connectToDatabase;
