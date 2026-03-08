import {
  fetchDriverStandings,
} from "../services/jolpica.service.js";

import {
  calculatePaZ,
  calculatePagg,
  calculatePc,
  calculatePr,
  calculatePt,
} from "../metrics/index.js";

//asynchronous function calculate all metrics for all drivers in a season
export async function calculateAllMetrics(db, year, teamMap) {
  //fetching the points for all drivers in the season to calculate mean and std deviation for PaZ calculation
  const pointsList = [];
  const driverPointsMap = {};

  //fetching driver standings to get points for all drivers in the season
  const standings = await fetchDriverStandings(year);

  //populating the pointsList and driverPointsMap with the points and positions for each driver in the season
  for (const standing of standings) {
    const apiId = standing.Driver.driverId;
    const pts = parseFloat(standing.points || 0);
    const pos = parseInt(standing.position || "0");

    pointsList.push(pts);
    driverPointsMap[apiId] = { pts, pos };
  }

  //calculating mean and std deviation of points for the season
  const mean = pointsList.reduce((a, b) => a + b, 0) / pointsList.length;
  const std = Math.sqrt(
    pointsList.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
      pointsList.length,
  );

  //fetching the season ID for the given year to use in the next queries
  const [[{ SeasonID: seasonID }]] = await db.query(
    `SELECT SeasonID FROM Seasons WHERE Year = ?`,
    [year],
  );
  //query to fetch all drivers and their API IDs to loop through for metric calculations
  const [driverRows] = await db.query(`
    SELECT DriverID, FirstName, LastName, API_DriverID FROM Drivers
  `);

  //looping through each driver to calculate their metrics based on their race results and points
  for (const driverRow of driverRows) {
    const driverId = driverRow.DriverID; //fetching the driverId from the query result
    const driverName = `${driverRow.FirstName} ${driverRow.LastName}`; //fetching and constructing the driver name for logging purposes
    const teammateId = teamMap[driverId] || null; //fetching the teammateId from the teamMap using the driverId, if no teammate exists, it will be null

    //intializing the number of times a driver wins against their teammate and vice versa respectively
    let dWin = 0;
    let tWin = 0;

    //query to fetch the positions and statuses of the driver in all races in the season
    const [positionsQueryResult] = await db.query(
      `SELECT Races.Track, Results.Position, Results.Status, Results.RaceID
        FROM Results 
        JOIN Races ON Results.RaceID = Races.RaceID
        WHERE Races.SeasonID = ? AND Results.DriverID = ?
       ORDER BY Races.RoundNo ASC`,
      [seasonID, driverId],
    );

    //if no valid race data found for the driver, log a warning and skip to the next driver
    if (!positionsQueryResult.length) {
      console.warn(`No race data found for Driver ${driverName}`);
      continue;
    }

    //filtering out positions that are outside the points scoring range or have non-racing statuses
    const validPositions = positionsQueryResult
      .filter(
        (row) =>
          row.Position <= 15 &&
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

    //logging all positions and statuses for the driver, marking any non-racing statuses that are ignored in the metric calculations
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

    //if no valid race data found for the driver, log a warning and skip to the next driver
    if (!validPositions.length) {
      console.warn(`No valid race data for Driver ${driverName}`);
      continue;
    }



    //if teammate exists, loop through the driver and teammate positions to count find dWin and tWin
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

    //calculating the metrics for the driver using the defined functions and the fetched data, and inserting/updating the metrics in the PerformanceMetrics table
    const n = validPositions.length;
    const sumpos = validPositions.reduce((sum, pos) => sum + pos, 0);
    const sumpos2 = validPositions.reduce((sum, pos) => sum + pos ** 2, 0);

    try {
      const Pc = calculatePc(sumpos, sumpos2, n);
      const Pt = calculatePt(validPositions);
      const driverStats = driverPointsMap[driverRow.API_DriverID];
      const points = driverStats?.pts ?? 0;

      const Pa = calculatePaZ(points, mean, std);

      const Pr = calculatePr(dWin, tWin);
      const Pagg = calculatePagg(Pr, Pc, Pt, Pa);

      //loggin the calculated metrics for the driver for debugging purposes
      console.log(
        `For Driver ${driverName} (${driverId}) in Season ${seasonID}: Pc=${Pc}, Pt=${Pt}, Pa=${Pa}, Pr=${Pr}`,
      );
      console.log(`Pagg: ${Pagg}`);

      //handling cases where any of the metrics are null or NaN to ensure database integrity, setting them to 0 in such cases
      const safePc = Pc == null || isNaN(Pc) ? 0 : Pc;
      const safePt = Pt == null || isNaN(Pt) ? 0 : Pt;
      const safePa = Pa == null || isNaN(Pa) ? 0 : Pa;
      const safePr = Pr == null || isNaN(Pr) ? 0 : Pr;
      const safePagg = Pagg == null || isNaN(Pagg) ? 0 : Pagg;

      //inserting/updating the calculated metrics for the driver in the PerformanceMetrics table
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
        safePagg,
      ]);
    } catch (error) {
      console.error(
        `Error calculating P values for Driver ${driverName} (${driverId}): ${error.message}`,
      );
    }
  }
}
