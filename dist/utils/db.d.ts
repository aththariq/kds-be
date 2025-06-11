declare class DatabaseConnection {
    private static instance;
    private connectionState;
    private constructor();
    static getInstance(): DatabaseConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getConnectionState(): string;
}
export declare const dbConnection: DatabaseConnection;
export default dbConnection;
