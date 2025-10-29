import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function testConnection() {
  try {
    const db = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT,
    });

    console.log("✅ Database connected successfully!");
    await db.end();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

testConnection();
