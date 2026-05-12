import mysql from "mysql2/promise";
import process from "process";

/**
 * Connects to MySQL.
 * @returns {Promise<import("mysql2/promise").Connection>} Active DB connection.
 */
export async function connectDB() {
  //declaring the variable that'll store the connection object
  let db;

  try {
    //creating a connection to the MySQL DB using the creds stored in .env
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT || 3306,
      ssl: { rejectUnauthorized: true },
    });
    console.log("Database Connected.");
    return db; //returning the connection object
  } catch (err) {
    console.error("Database Connection Failed:", err);
    //exiting the process if the connection does fail
    process.exit(1);
  }
}
