import express from "express";

export function createDriversRouter(db, updateDB) {
  const router = express.Router();

  router.get("/:season", async (req, res) => {
    await updateDB();
    const seasonYear = req.params.season;
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

      res.json(rows);
    } catch (err) {
      console.error("Error fetching driver data:", err);
      res.status(500).json({ error: "Failed to fetch driver data" });
    }
  });

  router.get("/:season/:driverIds", async (req, res) => {
    const seasonYear = req.params.season;
    const driverIds = req.params.driverIds.split(",").filter(Boolean);
    const placeholders = driverIds.map(() => "?").join(", ");

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

  return router
}
