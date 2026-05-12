import { fetchConstructorsForDriver } from "../services/jolpica.service.js";

/**
 * Assigns team relationships for season drivers.
 * @param {import("mysql2/promise").Connection} db Database connection.
 * @param {number} year Season year.
 * @param {Record<string, number>} driverMap API-to-DB driver map.
 * @returns {Promise<Record<number, number|null>>} Driver-to-teammate map.
 */
export async function assignTeams(db, year, driverMap) {
  const teamDrivers = {}; //creating object to store the team-driver relationships

  //looping through all drivers and fetching their constructor info to build the team-driver relationships
  for (const [apiId, driverId] of Object.entries(driverMap)) {
    try {
      const teamResponse = await fetchConstructorsForDriver(year, apiId); //fetching the constructor info for the driver
      let teamName = teamResponse?.[0]?.name; //fetching the name from the response

      //manual override for Tsunoda in 2025 due to API's misclassification
      if (year === 2025 && apiId === "tsunoda" && teamName === "RB F1 Team") {
        teamName = "Red Bull";
      }

      if (!teamName) continue; //skip if no team name found

      if (!teamDrivers[teamName]) teamDrivers[teamName] = []; //initialize array for team if not exists
      teamDrivers[teamName].push(driverId);
    } catch (error) {
      console.error(`Error fetching team for driver ${apiId}:`, error.message); //log error if API call fails
    }
  }

  const teamMap = {}; //creating object to store the final teammate relationships

  //fetching the season ID for the given year to use in the next queries
  const [seasonRow] = await db.query(
    `SELECT SeasonID FROM Seasons WHERE Year = ?`,
    [year],
  );

  const seasonID = seasonRow[0].SeasonID; //fetching the seasonID

  //fetching the number of races in a season for a given driver
  const [raceCounts] = await db.query(
    `
    SELECT DriverID, COUNT(*) as raceCount
    FROM Results
    WHERE SeasonID = ?
    GROUP BY DriverID
  `,
    [seasonID],
  );

  const raceCountMap = {}; //creating object to store the race counts for each driver

  //populating the raceCountMap with the results from the query 
  for (const row of raceCounts) {
    raceCountMap[row.DriverID] = row.raceCount;
  }

  //looping through each team and its drivers to assign teammates based on the number of races participated in
  for (const [teamName, members] of Object.entries(teamDrivers)) {

    //creating an array of valid team members based on the number of races they participated in, and sorting them in desc order of race count to prioritize main teammates who participated in more races.
    const validMembers = members
      .map((d) => ({ id: d, count: raceCountMap[d] || 0 }))
      .filter((obj) => obj.count >= 1)
      .sort((a, b) => b.count - a.count);

    //if no valid members found for the team, skip the team
    if (validMembers.length === 0) {
      console.warn(
        `Skipping team ${teamName} due to no drivers with race data`,
      );
      continue;
    }

    //main teammate is the driver with the most races participated in
    const mainDriver = validMembers[0];
    //teammate is the driver with the second most races participated in (can also be the same number as main driver)
    const teammate = validMembers[1] || null;

    //if exists, additional drivers are created for mid-season driver swaps
    const additional1 = validMembers[2]?.id || null;
    const additional2 = validMembers[3]?.id || null;

    //query to insert the team and teammate relationships into Teams
    await db.query(
      `
      INSERT INTO Teams (TeamName, SeasonID, Teammate1_ID, Teammate2_ID, AdditionalDriver1_ID, AdditionalDriver2_ID)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        Teammate1_ID = VALUES(Teammate1_ID), 
        Teammate2_ID = VALUES(Teammate2_ID),
        AdditionalDriver1_ID = VALUES(AdditionalDriver1_ID),
        AdditionalDriver2_ID = VALUES(AdditionalDriver2_ID);
      `,
      [
        teamName,
        seasonID,
        mainDriver.id,
        teammate?.id || null,
        additional1,
        additional2,
      ],
    );

    //populating the teamMap with the teammate relationships for easy lookup later, ensuring that all teammates are linked to each other
    teamMap[mainDriver.id] = teammate?.id || null;

    //if teammate exists, link them to the main driver and any additional drivers, and link additional drivers to each other if they exist
    if (teammate) teamMap[teammate.id] = mainDriver.id;
    if (additional1) teamMap[additional1] = mainDriver.id;
    if (additional2) teamMap[additional2] = mainDriver.id;

  }
  return teamMap;
}
