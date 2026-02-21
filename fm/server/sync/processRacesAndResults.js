import { fetchRaces, fetchResults } from "../services/jolpica.service.js"

export async function processRacesAndResults(db, year, driverMap) {
  const races = await fetchRaces(year)

  if (races.length === 0) {
    console.error(`No races found for year ${year}`);
  }

  await db.query(
    `INSERT INTO Seasons (Year, NoRounds) VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE NoRounds = VALUES(NoRounds)`,
    [year, races.length],
  );

  const [[{ SeasonID: seasonID }]] = await db.query(
    `SELECT SeasonID FROM Seasons WHERE Year = ?`,
    [year],
  );

  for (const race of races) {
    console.log(`Processing race: ${race.raceName} (${race.date})`);
    const { round, raceName, date } = race;
    const raceSQLQuery = `
      INSERT INTO Races (RoundNo, Track, Date, SeasonID)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        RoundNo = VALUES(RoundNo),
        Track = VALUES(Track),
        Date = VALUES(Date),
        SeasonID = VALUES(SeasonID)
    `;
    await db.query(raceSQLQuery, [round, raceName, date, seasonID]);

    const [[{ RaceID: raceID }]] = await db.query(
      `SELECT RaceID FROM Races WHERE Track = ? AND Date = ?`,
      [raceName, date],
    );
    if (!raceID) {
      console.error(`RaceID not found for ${raceName} on ${date}`);
      continue;
    }

    const linkQuery = `
      INSERT IGNORE INTO SeasonRaces (SeasonID, RaceID)
      VALUES (?, ?);
    `;
    await db.query(linkQuery, [seasonID, raceID]);

    try {
      const raceData = await fetchResults(year, round)
      const results = raceData?.Results || [];

      if (!raceData || !raceData.Results) {
        console.error(`No race results found for ${raceName} (${date}).`);
        continue;
      }

      for (const result of results) {
        const apiDriverID = result.Driver?.driverId;
        const driverId = driverMap[apiDriverID];
        if (!driverId) {
          console.error(
            `Missing driver ID in results for ${raceName} (${date}).`,
          );
          continue;
        }

        try {
          await db.query(
            `INSERT INTO Results (RaceID, DriverID, Position, Points, LapsCompleted, FastestLapTime, Status, SeasonID)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE 
                Position = VALUES(Position), 
                Points = VALUES(Points), 
                LapsCompleted = VALUES(LapsCompleted), 
                FastestLapTime = VALUES(FastestLapTime), 
                Status = VALUES(Status),
                SeasonID = VALUES(SeasonID);`,
            [
              raceID,
              driverId,
              result.position || null,
              result.points || 0,
              result.laps || 0,
              result.FastestLap?.Time?.time || null,
              result.status || null,
              seasonID,
            ],
          );
        } catch (error) {
          console.error(
            `Database insertion error for ${raceName}:`,
            error.message,
          );
        }
      }
    } catch (error) {
      console.error(
        `Failed to fetch results for ${raceName} (${date}): ${error.message}`,
      );
    }
  }
}