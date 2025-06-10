import connectToDatabase from './src/utils/db'; // Pastikan path ini benar dari root backend

async function testConnection() {
  console.log('Attempting to connect to MongoDB Atlas...');
  try {
    const connection = await connectToDatabase();
    console.log('Connection successful!');
    
    // Optional: Get server status or MongoDB version
    if (connection.connection && connection.connection.db) {
      const adminDb = connection.connection.db.admin(); // Perlu .connection untuk akses ke native driver
      const serverInfo = await adminDb.serverInfo();
      console.log(`MongoDB Server Version: ${serverInfo.version}`);
    } else {
      console.warn('Could not retrieve MongoDB server version: DB instance not available.');
    }
    
    // Penting untuk menutup koneksi setelah tes agar script bisa keluar
    await connection.disconnect();
    console.log('Disconnected from MongoDB Atlas.');
    process.exit(0); // Keluar dengan sukses
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1); // Keluar dengan error
  }
}

testConnection(); 