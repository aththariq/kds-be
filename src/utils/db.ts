import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria-simulation";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connectionState: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (this.connectionState) {
        console.log("Database already connected");
        return;
      }

      await mongoose.connect(MONGODB_URI);
      this.connectionState = true;
      console.log("Successfully connected to MongoDB");

      // Handle connection events
      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        this.connectionState = false;
      });

      mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error);
        this.connectionState = false;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
        this.connectionState = true;
      });
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      this.connectionState = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (!this.connectionState) {
        console.log("Database already disconnected");
        return;
      }

      await mongoose.disconnect();
      this.connectionState = false;
      console.log("Successfully disconnected from MongoDB");
    } catch (error) {
      console.error("Failed to disconnect from MongoDB:", error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.connectionState && mongoose.connection.readyState === 1;
  }

  public getConnectionState(): string {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return (
      states[mongoose.connection.readyState as keyof typeof states] || "unknown"
    );
  }
}

export const dbConnection = DatabaseConnection.getInstance();
export default dbConnection;
