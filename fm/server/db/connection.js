import mysql from "mysql2/promise";
import process from "process";
export async function connectDB(){
    let db;
    // Connect to MySQL using environment variables
    try {
    db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });
    console.log("Database Connected.");
    return db
    } catch (err) {
    console.error("Database Connection Failed:", err);
    process.exit(1);
    }
}