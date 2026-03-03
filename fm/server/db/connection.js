import mysql from "mysql2/promise";
import process from "process";

//asynchronous function to connect the DB to the app
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
    });
    console.log("Database Connected.");
    return db; //returning the connection object
    
  } catch (err) {
    console.error("Database Connection Failed:", err);
    //exiting the process if the connection does fail
    process.exit(1);
  }
}
