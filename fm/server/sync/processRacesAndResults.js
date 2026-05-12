import { fetchRaces, fetchResults } from "../services/jolpica.service.js"

/**
 * Syncs races and race results for a season.
 * @param {import("mysql2/promise").Connection} db Database connection.
 * @param {number} year Season year.
 * @param {Record<string, number>} driverMap API-to-DB driver map.
 * @returns {Promise<void>} Completes race/result sync.
 */
export async function processRacesAndResults(db, year, driverMap) {
  const races = await fetchRaces(year) //fetching all the drivers for that year

  //if no races, log error
  if (races.length === 0) {
    console.error(`No races found for year ${year}`);
  }

  //inserting/updating the season entry in the Seasons table with the number of rounds for the season
  await db.query(
    `INSERT INTO Seasons (Year, NoRounds) VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE NoRounds = VALUES(NoRounds)`,
    [year, races.length],
  );

  //fetching the season ID for the given year to use in the next queries
  const [[{ SeasonID: seasonID }]] = await db.query(
    `SELECT SeasonID FROM Seasons WHERE Year = ?`,
    [year],
  );

  // looping through each race in the season to insert/update the race details in the Races table, and then fetch and insert/update the results for each race in the Results table
  for (const race of races) {
    console.log(`Processing race: ${race.raceName} (${race.date})`);
    const { round, raceName, date } = race; //initializing the round, raceName, and date from the race object

    //query to insert race details into the Races table
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

    //fetching the raceID for the current race
    const [[{ RaceID: raceID }]] = await db.query(
      `SELECT RaceID FROM Races WHERE Track = ? AND Date = ?`,
      [raceName, date],
    );

    //if no raceID found, log error and and skip to next race
    if (!raceID) {
      console.error(`RaceID not found for ${raceName} on ${date}`);
      continue;
    }

    //linking the race to the season in the SeasonRaces table
    const linkQuery = `
      INSERT IGNORE INTO SeasonRaces (SeasonID, RaceID)
      VALUES (?, ?);
    `;
    await db.query(linkQuery, [seasonID, raceID]);

    //fetching the results for the current race and inserting/updating them in the Results table
    try {
      const raceData = await fetchResults(year, round)
      const results = raceData?.Results || [];

      //if no results found for the race log error and skip to next race
      if (!raceData || !raceData.Results) {
        console.error(`No race results found for ${raceName} (${date}).`);
        continue;
      }
      
      //looping through each result for the race to insert/update result details in Results table, linking to correct driver using driverMap, and to correct race using raceID
      for (const result of results) {
        const apiDriverID = result.Driver?.driverId; //fetching the API driver ID from the result object to map to internal driver ID
        const driverId = driverMap[apiDriverID];

        //if no driverId found in the driverMap, log error and skip to next result
        if (!driverId) {
          console.error(
            `Missing driver ID in results for ${raceName} (${date}).`,
          );
          continue;
        }

        //query to insert/update the result details in the Results table
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