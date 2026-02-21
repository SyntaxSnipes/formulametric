import {
  fetchDriverStandings,
  fetchStandingsForDriver,
} from "../services/jolpica.service.js";

import {
  calculatePaZ,
  calculatePagg,
  calculatePc,
  calculatePr,
  calculatePt,
} from "../metrics/index.js";

export async function calculateAllMetrics(db, year, teamMap) {
  const pointsList = [];
  const driverPointsMap = {};

  const standings = await fetchDriverStandings(year);

  for (const standing of standings) {
    const apiId = standing.Driver.driverId;
    const pts = parseFloat(standing.points || 0);
    const pos = parseInt(standing.position || "0");

    pointsList.push(pts);
    driverPointsMap[apiId] = { pts, pos };
  }

  const mean = pointsList.reduce((a, b) => a + b, 0) / pointsList.length;
  const std = Math.sqrt(
    pointsList.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
      pointsList.length,
  );

  const [[{ SeasonID: seasonID }]] = await db.query(
    `SELECT SeasonID FROM Seasons WHERE Year = ?`,
    [year],
  );
  const [driverRows] = await db.query(`
    SELECT DriverID, FirstName, LastName, API_DriverID FROM Drivers
  `);

  for (const driverRow of driverRows) {
    const driverId = driverRow.DriverID;
    const driverName = `${driverRow.FirstName} ${driverRow.LastName}`;
    const teammateId = teamMap[driverId] || null;

    let dWin = 0;
    let tWin = 0;

    const [positionsQueryResult] = await db.query(
      `SELECT Races.Track, Results.Position, Results.Status, Results.RaceID
        FROM Results 
        JOIN Races ON Results.RaceID = Races.RaceID
        WHERE Races.SeasonID = ? AND Results.DriverID = ?
       ORDER BY Races.RoundNo ASC`,
      [seasonID, driverId],
    );

    if (!positionsQueryResult.length) {
      console.warn(`No race data found for Driver ${driverName}`);
      continue;
    }

    const validPositions = positionsQueryResult
      .filter(
        (row) =>
          row.Position <= 15 ||
          ![
            "Engine",
            "Power Unit",
            "Brakes",
            "Collision damage",
            "Retired",
            "Fuel leak",
            "Overheating",
            "Mechanical",
            "Disqualified",
            "Water pressure",
            "Front wing",
          ].includes(row.Status),
      )
      .map((row) => row.Position);

    console.log(`Positions for Driver ${driverName} (${driverId}):`);
    positionsQueryResult.forEach((row) => {
      const statusNote = [
        "Engine",
        "Power Unit",
        "Brakes",
        "Collision damage",
        "Retired",
        "Fuel leak",
        "Overheating",
        "Mechanical",
        "Disqualified",
        "Water pressure",
      ].includes(row.Status)
        ? ` (Ignored: ${row.Status})`
        : "";
      console.log(
        `- Track: ${row.Track}, Position: ${row.Position}${statusNote}`,
      );
    });

    if (!validPositions.length) {
      console.warn(`No valid race data for Driver ${driverName}`);
      continue;
    }

    let points = 0;
    let position = null;

    try {
      const driverStanding =
        (await fetchStandingsForDriver(year, driverRow.API_DriverID)) || [];

      if (driverStanding) {
        points = parseInt(driverStanding.points, 10) || 0; // Convert points to an integer safely
        position = parseInt(driverStanding.position, 10) || null; // Convert position safely

        console.log(
          `📊 ${driverRow.FirstName} ${driverRow.LastName} (${year}) -> Position: ${position}, Points: ${points}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to fetch standings for ${driverRow.FirstName} ${driverRow.LastName} (${year}): ${error.message}`,
      );
    }
    if (teammateId) {
      for (const row of positionsQueryResult) {
        const [teammateRow] = await db.query(
          `SELECT Position FROM Results WHERE RaceID = ? AND DriverID = ?`,
          [row.RaceID, teammateId],
        );
        if (teammateRow.length > 0) {
          const teammatePos = teammateRow[0].Position;
          if (row.Position < teammatePos) dWin++;
          else if (row.Position > teammatePos) tWin++;
        }
      }
    }
    const n = validPositions.length;
    const sumpos = validPositions.reduce((sum, pos) => sum + pos, 0);
    const sumpos2 = validPositions.reduce((sum, pos) => sum + pos ** 2, 0);

    try {
      const Pc = calculatePc(sumpos, sumpos2, n);
      const Pt = calculatePt(validPositions);
      const driverStats = driverPointsMap[driverRow.API_DriverID];
      const pointsForPa = driverStats?.pts ?? 0;

      const Pa = calculatePaZ(pointsForPa, mean, std);

      const Pr = calculatePr(dWin, tWin);
      const Pagg = calculatePagg(Pr, Pc, Pt, Pa);
      console.log(
        `For Driver ${driverName} (${driverId}) in Season ${seasonID}: Pc=${Pc}, Pt=${Pt}, Pa=${Pa}, Pr=${Pr}`,
      );
      console.log(`Pagg: ${Pagg}`);

      const safePc = Pc == null || isNaN(Pc) ? 0 : Pc;
      const safePt = Pt == null || isNaN(Pt) ? 0 : Pt;
      const safePa = Pa == null || isNaN(Pa) ? 0 : Pa;
      const safePr = Pr == null || isNaN(Pr) ? 0 : Pr;

      const updateQuery = `
        INSERT INTO PerformanceMetrics (DriverID, SeasonID, PConsistency, PTrajectory, PAbsolute, PRelative, PAggregate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          PConsistency = VALUES(PConsistency), 
          PTrajectory = VALUES(PTrajectory), 
          PAbsolute = VALUES(PAbsolute),
          PRelative = VALUES(PRelative),
          PAggregate = VALUES(PAggregate);
      `;

      await db.query(updateQuery, [
        driverId,
        seasonID,
        safePc,
        safePt,
        safePa,
        safePr,
        Pagg,
      ]);
    } catch (error) {
      console.error(
        `Error calculating P values for Driver ${driverName} (${driverId}): ${error.message}`,
      );
    }
  }
}
