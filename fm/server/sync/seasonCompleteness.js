import { fetchRaces } from "../services/jolpica.service.js"
export async function isSeasonDataComplete(db, year) {
  try {
    const racesFromAPI = await fetchRaces(year) || [];
    const expectedRaceCount = racesFromAPI.length;

    // Check the Seasons table for the season entry.
    const [seasonRows] = await db.query(
      `SELECT SeasonID, NoRounds FROM Seasons WHERE Year = ?`,
      [year],
    );
    if (seasonRows.length === 0) {
      // No season data exists at all.
      return false;
    }
    const seasonID = seasonRows[0].SeasonID;
    // If the stored number of rounds matches the expected count, further check the Races table.
    if (Number(seasonRows[0].NoRounds) !== expectedRaceCount) {
      return false;
    }
    // Check the Races table count for this season.
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
    return false; // If in doubt, force an update.
  }
}