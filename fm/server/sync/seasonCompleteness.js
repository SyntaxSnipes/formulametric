import { fetchRaces } from "../services/jolpica.service.js"

//asynchronous function to check if the season data is complete
export async function isSeasonDataComplete(db, year) {
  try {
    const racesFromAPI = await fetchRaces(year) || []; //fetching the races from the API for the given year
    const expectedRaceCount = racesFromAPI.length; //fetching the expected number of races for the season

    //check the Seasons table for the season entry.
    const [seasonRows] = await db.query(
      `SELECT SeasonID, NoRounds FROM Seasons WHERE Year = ?`,
      [year],
    );
    if (seasonRows.length === 0) {
      return false;
    }
    const seasonID = seasonRows[0].SeasonID; //fetching the seasonID for the season entry

    //if stored number of rounds matches the expected count, further check the Races table.
    if (Number(seasonRows[0].NoRounds) !== expectedRaceCount) {
      return false;
    }
    //check the Races table count for this season.
    const [raceCountRows] = await db.query(
      `SELECT COUNT(*) AS raceCount FROM Races WHERE SeasonID = ?`,
      [seasonID],
    );
    if (
      raceCountRows.length > 0 &&
      Number(raceCountRows[0].raceCount) === expectedRaceCount
    ) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(
      `Error checking completeness for season ${year}:`,
      error.message,
    );
    return false; //force update if any error occurs during the completeness check to ensure data integrity
  }
}