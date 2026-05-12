import dotenv from "dotenv";
import express from "express";
dotenv.config(); //load env vars from .env
import { createDriversRouter } from "./routes/drivers.routes.js";
import cors from "cors";

//initialize express
const app = express();

//setting up CORS for front-end and back-end to work better.
app.use(cors());

const PORT = 5000;

import { connectDB } from "./db/connection.js"; //page 51
import { updateDB } from "./sync/updateDB.js"; //

//extracting the db var from the connectDB func
const db = await connectDB();

//create drivers route and pass db connection and updateDB func to it so that it can be used in the route
app.use(
  "/api/drivers",
  createDriversRouter(db, () => updateDB(db)),
);

//start express server on defined port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
