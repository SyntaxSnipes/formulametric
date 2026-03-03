import { insertAllDrivers } from "./insertDrivers.js";
import { isSeasonDataComplete } from "./seasonCompleteness.js";
import { processRacesAndResults } from "./processRacesAndResults.js";
import { assignTeams } from "./assignTeams.js";
import { calculateAllMetrics } from "./calculateMetrics.js"

let isUpdating = false //flag to prevent concurrent updates, ensuring only one update process runs at a time

//asynchronous function to update the database with the latest data from the API for each season
export async function updateDB(db) {
  //if an update is already in progress, log message and skip to prevent concurrent updates
  if (isUpdating) {
    console.log("Update already in progress. Skipping...");
    return;
  }
  isUpdating = true; //setting the flag to indicate an update is in progress

  //looping through each season from 2022 to 2025 processing the races and results, assign teams, and calculate metrics for the season
  try {
    console.log("The server is updating now");
    for (let year = 2022; year <= 2025; year++) {
      //if the season data is complete, skip the processing and calculations
      const complete = await isSeasonDataComplete(db, year);
      if (complete) {
        console.log(`Season ${year} is complete. Skipping API updates.`);
        continue;
      }

      const driverMap = await insertAllDrivers(db, year);
      await processRacesAndResults(db, year, driverMap);
      const teamMap = await assignTeams(db, year, driverMap);
      await calculateAllMetrics(db, year, teamMap);
    }
    console.log("Database update completed.");
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    isUpdating = false; //resetting the flag after the update process is complete to allow future updates
  }
}