import { fetchConstructorsForDriver } from "../services/jolpica.service.js";

export async function assignTeams(db, year, driverMap) {
  const teamDrivers = {};
  for (const [apiId, driverId] of Object.entries(driverMap)) {
    try {
      const teamResponse = await fetchConstructorsForDriver(year, apiId);
      let teamName = teamResponse?.[0]?.name;

      // Manual override for known edge cases
      if (year === 2025 && apiId === "tsunoda" && teamName === "RB F1 Team") {
        teamName = "Red Bull";
      }

      if (!teamName) continue;

      if (!teamDrivers[teamName]) teamDrivers[teamName] = [];
      teamDrivers[teamName].push(driverId);
    } catch (error) {
      console.error(`Error fetching team for driver ${apiId}:`, error.message);
    }
  }

  const teamMap = {};
  const [seasonRow] = await db.query(
    `SELECT SeasonID FROM Seasons WHERE Year = ?`,
    [year],
  );
  const seasonID = seasonRow[0].SeasonID;
  const [raceCounts] = await db.query(
    `
    SELECT DriverID, COUNT(*) as raceCount
    FROM Results
    WHERE SeasonID = ?
    GROUP BY DriverID
  `,
    [seasonID],
  );

  const raceCountMap = {};
  for (const row of raceCounts) {
    raceCountMap[row.DriverID] = row.raceCount;
  }

  for (const [teamName, members] of Object.entries(teamDrivers)) {
    const validMembers = members
      .map((d) => ({ id: d, count: raceCountMap[d] || 0 }))
      .filter((obj) => obj.count >= 1)
      .sort((a, b) => b.count - a.count);

    if (validMembers.length === 0) {
      console.warn(
        `Skipping team ${teamName} due to no drivers with race data`,
      );
      continue;
    }

    const mainDriver = validMembers[0];
    const teammate = validMembers[1] || null;

    const additional1 = validMembers[2]?.id || null;
    const additional2 = validMembers[3]?.id || null;

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

    teamMap[mainDriver.id] = teammate?.id || null;
    if (teammate) teamMap[teammate.id] = mainDriver.id;
    if (additional1) teamMap[additional1] = mainDriver.id;
    if (additional2) teamMap[additional2] = mainDriver.id;

    console.log(
      `Main teammate(s) assigned in ${teamName}: ${mainDriver.id} ${
        teammate ? `and ${teammate.id}` : "(solo driver)"
      }`,
    );
  }
  return teamMap;
}
