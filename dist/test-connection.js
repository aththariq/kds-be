"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./src/utils/db")); // Pastikan path ini benar dari root backend
async function testConnection() {
    console.log('Attempting to connect to MongoDB Atlas...');
    try {
        const connection = await (0, db_1.default)();
        console.log('Connection successful!');
        // Optional: Get server status or MongoDB version
        if (connection.connection && connection.connection.db) {
            const adminDb = connection.connection.db.admin(); // Perlu .connection untuk akses ke native driver
            const serverInfo = await adminDb.serverInfo();
            console.log(`MongoDB Server Version: ${serverInfo.version}`);
        }
        else {
            console.warn('Could not retrieve MongoDB server version: DB instance not available.');
        }
        // Penting untuk menutup koneksi setelah tes agar script bisa keluar
        await connection.disconnect();
        console.log('Disconnected from MongoDB Atlas.');
        process.exit(0); // Keluar dengan sukses
    }
    catch (error) {
        console.error('Connection failed:', error);
        process.exit(1); // Keluar dengan error
    }
}
testConnection();
