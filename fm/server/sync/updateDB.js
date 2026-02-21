import { insertAllDrivers } from "./insertDrivers.js";
import { isSeasonDataComplete } from "./seasonCompleteness.js";
import { processRacesAndResults } from "./processRacesAndResults.js";
import { assignTeams } from "./assignTeams.js";
import { calculateAllMetrics } from "./calculateMetrics.js"

let isUpdating = false

export async function updateDB(db) {
  if (isUpdating) {
    console.log("Update already in progress. Skipping...");
    return;
  }
  isUpdating = true;

  try {
    console.log("The server is updating now");
    for (let year = 2022; year <= 2025; year++) {
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
    isUpdating = false;
  }
}