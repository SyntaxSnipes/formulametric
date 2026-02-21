// these are some of the imports we need, dotenv is for loading the env file, axios is for making request to the api, cron is for scheduling update of db
import dotenv from "dotenv";
import express from "express";
dotenv.config();
import { createDriversRouter } from "./routes/drivers.routes.js";
import cors from "cors";

//Initialize express, and setting up CORS for front-end and back-end to work better.
const app = express();
app.use(cors());
const PORT = 5000;

import { connectDB } from "./db/connection.js";
import { updateDB } from "./sync/updateDB.js";

const db = await connectDB();

app.use(
  "/api/drivers",
  createDriversRouter(db, () => updateDB(db)),
);

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
