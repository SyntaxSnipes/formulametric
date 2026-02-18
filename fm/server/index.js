// these are some of the imports we need, dotenv is for loading the env file, axios is for making request to the api, cron is for scheduling update of db
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mysql from "mysql2/promise";
import axios from "axios";
import cors from "cors";
import { abs, sqrt, floor, e, re, count } from "mathjs";

// Initialize Express
const app = express();
app.use(cors());
const PORT = 5000;

// Sleep function created to prevent exceeding API burst limit
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Declare database globally
let db;
let isUpdating = false;
// Connect to MySQL using environment variables
try {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  console.log("Database Connected.");
} catch (err) {
  console.error("Database Connection Failed:", err);
  process.exit(1);
}

// Helper function: Check if season data is complete in the database.
async function isSeasonDataComplete(year) {
  try {
    // Fetch the race data from the API for the given year.
    const raceResponse = await axios.get(
      `https://api.jolpi.ca/ergast/f1/${year}/races.json`
    );
    const racesFromAPI = raceResponse.data.MRData.RaceTable.Races || [];
    const expectedRaceCount = racesFromAPI.length;

    // Check the Seasons table for the season entry.
    const [seasonRows] = await db.query(
      `SELECT SeasonID, NoRounds FROM Seasons WHERE Year = ?`,
      [year]
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
      [seasonID]
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
      error.message
    );
    return false; // If in doubt, force an update.
  }
}

//Here are the functions to update the database, decomposing the problem into smaller parts
async function insertAllDrivers(year) {
  await sleep(500);
  const driverResponse = await axios.get(
    `https://api.jolpi.ca/ergast/f1/${year}/drivers.json`
  );
  const drivers = driverResponse.data.MRData.DriverTable.Drivers || [];
  for (const driver of drivers) {
    const driverSQLQuery = `
      INSERT INTO Drivers (API_DriverID, RacingNumber, FirstName, LastName, Country)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        RacingNumber = VALUES(RacingNumber),
        FirstName = VALUES(FirstName), 
        LastName = VALUES(LastName), 
        Country = VALUES(Country);
    `;
    await db.query(driverSQLQuery, [
      driver.driverId,
      driver.permanentNumber || null,
      driver.givenName,
      driver.familyName,
      driver.nationality,
    ]);
  }
  console.log(`Drivers updated for season ${year}`);
  const driverMap = {};

  const [allDrivers] = await db.query(
    `SELECT API_DriverID, DriverID FROM Drivers`
  );
  for (const d of allDrivers) {
    driverMap[d.API_DriverID] = d.DriverID;
  }
  // After inserting drivers from /drivers.json
  const standingsRes = await axios.get(
    `https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`
  );
  const standingsList =
    standingsRes.data?.MRData?.StandingsTable?.StandingsLists?.[0]
      ?.DriverStandings || [];

  for (const standing of standingsList) {
    const d = standing.Driver;
    const driverSQLQuery = `
    INSERT INTO Drivers (API_DriverID, RacingNumber, FirstName, LastName, Country)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      RacingNumber = VALUES(RacingNumber),
      FirstName = VALUES(FirstName), 
      LastName = VALUES(LastName), 
      Country = VALUES(Country);
  `;
    await db.query(driverSQLQuery, [
      d.driverId,
      d.permanentNumber || null,
      d.givenName,
      d.familyName,
      d.nationality,
    ]);
  }

  return driverMap;
}

async function assignTeams(year, driverMap) {
  const teamDrivers = {};
  await sleep(500);
  for (const [apiId, driverId] of Object.entries(driverMap)) {
    try {
      const teamResponse = await axios.get(
        `https://api.jolpi.ca/ergast/f1/${year}/drivers/${apiId}/constructors.json`
      );
      const teamData =
        teamResponse.data.MRData.ConstructorTable.Constructors || [];
      let teamName =
        teamResponse?.data?.MRData?.ConstructorTable?.Constructors?.[0]?.name;

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
    [year]
  );
  const seasonID = seasonRow[0].SeasonID;
  const [raceCounts] = await db.query(
    `
    SELECT DriverID, COUNT(*) as raceCount
    FROM Results
    WHERE SeasonID = ?
    GROUP BY DriverID
  `,
    [seasonID]
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
        `Skipping team ${teamName} due to no drivers with race data`
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
      ]
    );

    teamMap[mainDriver.id] = teammate?.id || null;
    if (teammate) teamMap[teammate.id] = mainDriver.id;
    if (additional1) teamMap[additional1] = mainDriver.id;
    if (additional2) teamMap[additional2] = mainDriver.id;

    console.log(
      `Main teammate(s) assigned in ${teamName}: ${mainDriver.id} ${
        teammate ? `and ${teammate.id}` : "(solo driver)"
      }`
    );
  }
  return teamMap;
}

async function processRacesAndResults(year, driverMap) {
  await sleep(500);
  const raceResponse = await axios.get(
    `https://api.jolpi.ca/ergast/f1/${year}/races.json`
  );
  const races = raceResponse.data.MRData.RaceTable?.Races || [];
  if (races.length === 0) {
    console.error(`No races found for year ${year}`);
  }

  await db.query(
    `INSERT INTO Seasons (Year, NoRounds) VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE NoRounds = VALUES(NoRounds)`,
    [year, races.length]
  );

  const [[{ SeasonID: seasonID }]] = await db.query(
    `SELECT SeasonID FROM Seasons WHERE Year = ?`,
    [year]
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
      [raceName, date]
    );
    if (!raceID) {
      console.error(`RaceID not found for ${raceName} on ${date}`);
    }

    const linkQuery = `
      INSERT IGNORE INTO SeasonRaces (SeasonID, RaceID)
      VALUES (?, ?);
    `;
    await db.query(linkQuery, [seasonID, raceID]);

    try {
      const resultResponse = await axios.get(`
        https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json
      `);
      const raceData = resultResponse?.data?.MRData?.RaceTable?.Races?.[0];
      const results = raceData?.Results || [];
      if (!raceData || !raceData.Results) {
        console.error(`No race results found for ${raceName} (${date}).`);
        continue;
      }
      if (!raceData || !raceData.Results) {
        console.error(`No race results found for ${raceName} (${date}).`);
        continue;
      }

      for (const result of results) {
        const apiDriverID = result.Driver?.driverId;
        const driverId = driverMap[apiDriverID];
        if (!driverId) {
          console.error(
            `Missing driver ID in results for ${raceName} (${date}).`
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
            ]
          );
        } catch (error) {
          console.error(
            `Database insertion error for ${raceName}:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error(
        `Failed to fetch results for ${raceName} (${date}): ${error.message}`
      );
    }
  }
}

async function calculateAllMetrics(year, teamMap) {
  const pointsList = [];
  const driverPointsMap = {};

  const standingsUrl = `https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`;
  const { data } = await axios.get(standingsUrl);
  const standings =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

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
      pointsList.length
  );

  const [[{ SeasonID: seasonID }]] = await db.query(
    `SELECT SeasonID FROM Seasons WHERE Year = ?`,
    [year]
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
      [seasonID, driverId]
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
          ].includes(row.Status)
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
        `- Track: ${row.Track}, Position: ${row.Position}${statusNote}`
      );
    });

    if (!validPositions.length) {
      console.warn(`No valid race data for Driver ${driverName}`);
      continue;
    }

    let points = 0;
    let position = null;
    try {
      await sleep(750);
      const standingsUrl = `https://api.jolpi.ca/ergast/f1/${year}/drivers/${driverRow.API_DriverID}/driverStandings.json`;
      const { data } = await axios.get(standingsUrl);
      const standingsLists = data?.MRData?.StandingsTable?.StandingsLists || [];
      const driverStanding = standingsLists[0]?.DriverStandings?.[0] || [];
      if (driverStanding) {
        points = parseInt(driverStanding.points, 10) || 0; // Convert points to an integer safely
        position = parseInt(driverStanding.position, 10) || null; // Convert position safely

        console.log(
          `📊 ${driverRow.FirstName} ${driverRow.LastName} (${year}) -> Position: ${position}, Points: ${points}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to fetch standings for ${driverRow.FirstName} ${driverRow.LastName} (${year}): ${error.message}`
      );
    }
    if (teammateId) {
      for (const row of positionsQueryResult) {
        const [teammateRow] = await db.query(
          `SELECT Position FROM Results WHERE RaceID = ? AND DriverID = ?`,
          [row.RaceID, teammateId]
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
      const points = driverStats?.pts ?? 0;
      const position = driverStats?.pos ?? null;

      const Pa = calculatePaZ(points, mean, std);

      const Pr = calculatePr(dWin, tWin);
      const Pagg = calculatePagg(Pr, Pc, Pt, Pa);
      console.log(
        `For Driver ${driverName} (${driverId}) in Season ${seasonID}: Pc=${Pc}, Pt=${Pt}, Pa=${Pa}, Pr=${Pr}`
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
        `Error calculating P values for Driver ${driverName} (${driverId}): ${error.message}`
      );
    }
  }
}

async function updateDB() {
  if (isUpdating) {
    console.log("Update already in progress. Skipping...");
    return;
  }
  isUpdating = true;

  try {
    console.log("The server is updating now");
    for (let year = 2025; year <= 2025; year++) {
      const complete = await isSeasonDataComplete(year);
      if (complete) {
        console.log(`Season ${year} is complete. Skipping API updates.`);
        continue;
      }

      const driverMap = await insertAllDrivers(year);
      await processRacesAndResults(year, driverMap);
      const teamMap = await assignTeams(year, driverMap);
      await calculateAllMetrics(year, teamMap);
    }
    console.log("Database update completed.");
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    isUpdating = false;
  }
}

app.get("/api/drivers/:season", async (req, res) => {
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
      [seasonYear]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching driver data:", err);
    res.status(500).json({ error: "Failed to fetch driver data" });
  }
});

app.get("/api/drivers/:season/:driverIds", async (req, res) => {
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
      [seasonYear, ...driverIds]
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
        [seasonYear, id]
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

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//FUNCTIONS TO CALCULATE THE P VALUES
// Pc is the peformance metric of consistency
// sumr is the sum of races (ordinal), sumpos is the sum of race points acheived, sumrp is the sum of the product of race and points, sumr2 is the sum of the square and
//  sumpos2 is the sum of the square of the points, n is the number of data points (typically number of races)
function calculatePc(sumpos, sumpos2, n) {
  if (sumpos === 0 || n === 0 || sumpos2 === 0) return 0;
  if (n < 5) return null;

  // Calculate mean and standard deviation
  const mean = sumpos / n;
  const std = Math.sqrt(sumpos2 / n - mean ** 2);

  // Calculate Pc
  const Pc = 1 - Math.min(1, ((std / 4) ** 2 + 0.3));
  return Number(Math.max(0, Math.min(1, Pc))).toPrecision(2);
}

function calculatePaZ(points, mean, std) {
  if (!std || std === 0) return 0.5;

  const z = (points - mean) / std;
  const pa = 1 / (1 + Math.exp(-z)); // logistic sigmoid
  return Number(pa.toFixed(2));
}

function calculatePt(positions) {
  if (!Array.isArray(positions) || positions.length < 8) {
    console.warn("⚠️ Pt calculation skipped due to insufficient data");
    return 0.5; // Neutral trajectory if not enough races
  }

  let n = positions.length;
  let qSize = Math.floor(n / 4);

  // Extract quartiles
  let Q1 = positions.slice(0, qSize);
  let Q2 = positions.slice(qSize, 2 * qSize);
  let Q3 = positions.slice(2 * qSize, 3 * qSize);
  let Q4 = positions.slice(3 * qSize);

  // Compute average positions for each quartile
  let avgQ1 = Q1.reduce((sum, pos) => sum + pos, 0) / Q1.length;
  let avgQ2 = Q2.reduce((sum, pos) => sum + pos, 0) / Q2.length;
  let avgQ3 = Q3.reduce((sum, pos) => sum + pos, 0) / Q3.length;
  let avgQ4 = Q4.reduce((sum, pos) => sum + pos, 0) / Q4.length;

  // Compute trajectory trends
  let longTermTrend = (avgQ1 - avgQ4) / Math.max(avgQ1, avgQ4);
  let midTermTrend = (avgQ2 - avgQ3) / Math.max(avgQ2, avgQ3);

  // Compute final trajectory score
  let Pt = 0.5 + 0.15 * longTermTrend + 0.1 * midTermTrend;

  console.log(`DEBUG: Q1=${avgQ1}, Q2=${avgQ2}, Q3=${avgQ3}, Q4=${avgQ4}`);
  console.log(
    `DEBUG: LongTermTrend=${longTermTrend}, MidTermTrend=${midTermTrend}, Final Pt=${Pt}`
  );

  return 1.5 * Number(Math.max(0, Math.min(1, Pt)).toPrecision(2));
}

function calculatePr(dWin, tWin) {
  console.log(`DEBUG: dWin=${dWin}, tWin=${tWin}`);
  if (dWin + tWin === 0) return 0;
  return Math.min(1, 1.2 * Number((dWin / (dWin + tWin)).toPrecision(2)));
}

// Pagg is the aggregate performance metric
function calculatePagg(Pr, Pc, Pt, Pa) {
  if (
    Pr === undefined ||
    Pc === undefined ||
    Pt === undefined ||
    Pa === undefined
  ) {
    console.warn("Invalid input for Pagg calculation");
    return null;
  }
  return Number((0.3 * Pr + 0.23 * Pt + 0.23 * Pa + 0.24 * Pc).toFixed(2));
}
