import express from "express";

export function createDriversRouter(db, updateDB) {
  //create expres router for drivers route, handing all rqs to this router
  const router = express.Router();

  //GET route to fetch all drivers and info for a given season
  router.get("/:season", async (req, res) => {
    await updateDB(); //calling updateDB to ensure latest data is fetched
    const seasonYear = req.params.season; //extracting season year from route params

    //query to fetch driver info and metrics for the season, joining necessary tables to get team names
    try {
      const [rows] = await db.query(
        `
      SELECT d.DriverID, d.FirstName, d.LastName, d.Country, d.RacingNumber, 
            pm.PConsistency, pm.PTrajectory, pm.PAbsolute, pm.PRelative, pm.PAggregate,
            t.TeamName
      FROM Drivers d
      JOIN PerformanceMetrics pm ON d.DriverID = pm.DriverID
      JOIN Seasons s ON s.SeasonID = pm.SeasonID
      JOIN Teams t ON 
        t.SeasonID = s.SeasonID AND 
        (
          d.DriverID = t.Teammate1_ID OR 
          d.DriverID = t.Teammate2_ID OR 
          d.DriverID = t.AdditionalDriver1_ID OR 
          d.DriverID = t.AdditionalDriver2_ID
        )
      WHERE s.Year = ?
      ORDER BY d.RacingNumber ASC
    `,
        [seasonYear],
      );

      res.json(rows); //return fetched data as JSON
    } catch (err) {
      console.error("Error fetching driver data:", err);
      res.status(500).json({ error: "Failed to fetch driver data" });
    }
  });


  //GET route to fetch driver info for list of driver IDs, used in driver comparison
  router.get("/:season/:driverIds", async (req, res) => {
    const seasonYear = req.params.season; //extracting season year from route params

    //splitting driverIds param into array of IDs, filtering out any empty strings
    const driverIds = req.params.driverIds.split(",").filter(Boolean);
    const placeholders = driverIds.map(() => "?").join(", ");

    //query to fetch driver info and metrics for the season, joining necessary tables to get team names, and filtering by driver IDs
    try {
      const [driverInfo] = await db.query(
        `
    SELECT d.DriverID, d.FirstName, d.LastName, d.Country, d.RacingNumber, 
            pm.PConsistency, pm.PTrajectory, pm.PAbsolute, pm.PRelative, pm.PAggregate
    FROM Drivers d
    JOIN PerformanceMetrics pm ON d.DriverID = pm.DriverID
    JOIN Seasons s ON s.SeasonID = pm.SeasonID
    WHERE s.Year = ? AND d.DriverID IN (${placeholders})
  `,
        [seasonYear, ...driverIds],
      );

      const raceResults = {};
      for (const id of driverIds) {
        const [results] = await db.query(
          `
      SELECT r.RoundNo, r.Track, r.Date, res.Position, res.Status, 
            pm.PConsistency, pm.PTrajectory, pm.PAbsolute, pm.PRelative, pm.PAggregate, s.NoRounds
      FROM Results res
      JOIN Races r ON res.RaceID = r.RaceID
      JOIN Seasons s ON r.SeasonID = s.SeasonID
      JOIN PerformanceMetrics pm ON res.DriverID = pm.DriverID AND s.SeasonID = pm.SeasonID
      WHERE s.Year = ? AND res.DriverID = ?
      ORDER BY r.RoundNo ASC
    `,
          [seasonYear, id],
        );

        raceResults[`driver${id}`] = results;
      }

      if (driverInfo.length > 0) {
        res.json({
          drivers: driverInfo,
          races: raceResults,
        });
      } else {
        res
          .status(404)
          .json({ error: "Drivers not found for the specified season." });
      }
    } catch (err) {
      console.error("Error fetching driver data:", err);
      res.status(500).json({ error: "Failed to fetch driver data" });
    }
  });
  // return router to be used in index.js (page 51)
  return router;
}
