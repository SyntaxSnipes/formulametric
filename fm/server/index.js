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

// Declare database globally
let db;

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


// Update DB function
async function updateDB() {
  try {
    console.log("The server is updating now");
    for (let year = 2022; year <= 2024; year++) {
      console.log(`Fetching data for year ${year}...`);
      // Fetch and insert drivers first
      const driverResponse = await axios.get(`https://api.jolpi.ca/ergast/f1/${year}/drivers.json`);
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
        `
        await db.query(driverSQLQuery, [
          driver.driverId,
          driver.permanentNumber || null,
          driver.givenName,
          driver.familyName,
          driver.nationality,
        ]);
      }
      console.log(`Drivers updated for season ${year}`);

      // Fetch and process races
      const raceResponse = await axios.get(`https://api.jolpi.ca/ergast/f1/${year}/races.json`);
      const races = raceResponse.data.MRData.RaceTable?.Races || [];
      if (races.length === 0) {
        console.error(`No races found for year ${year}`);
        continue;
      }

      const seasonQuery = `
        INSERT INTO Seasons (Year, NoRounds) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE NoRounds = VALUES(NoRounds);
      `;
      await db.query(seasonQuery, [year, races.length]);

      const [seasonRows] = await db.query(
        `SELECT SeasonID FROM Seasons WHERE Year = ?`, [year]
      );
      
      if (seasonRows.length === 0) {
        console.error(`Error: No SeasonID found for year ${year}`);
        continue;
      }

      const seasonID = seasonRows[0].SeasonID;

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
            SeasonID = VALUES(SeasonID);
        `;
        await db.query(raceSQLQuery, [round, raceName, date, seasonID]);
        
        const [raceRows] = await db.query(
          `SELECT RaceID FROM Races WHERE Track = ? AND Date = ?`, [raceName, date]
        );
        const raceID = raceRows.length ? raceRows[0].RaceID : null;
        if (!raceID) {
          console.error(`Race ${raceName} (${date}) not found in DB.`);
          continue;
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
          if (!raceData || !raceData.Results) {
            console.error(`No race results found for ${raceName} (${date}).`);
            continue;
          }
          if (!raceData || !raceData.Results) {
            console.error(`No race results found for ${raceName} (${date}).`);
            continue;
          }

          const results = raceData?.Results || [];
          for (const result of results) {
            if (!result.Driver?.driverId) {
              console.error(`Missing driver ID in results for ${raceName} (${date}).`);
              continue;
            }
            const driverIDQuery = `
              SELECT DriverID FROM Drivers WHERE API_DriverID = ?;
            `;
            const [driverRows] = await db.query(driverIDQuery, [
              result.Driver.driverId,
            ]);
          }
          for (const result of results) {
            const driverData = result?.Driver;
            if (!driverData?.driverId) {
              console.error(`Missing driver ID for ${raceName} on ${date}. Full result:`, JSON.stringify(result, null, 2));
              continue; 
            }
          
            if (!driverData?.driverId) {
              console.error(`Missing driver ID for ${raceName}. Full result:`, JSON.stringify(result, null, 2));
              continue;
            }
            // Correctly retrieve DriverID
            const [[driverRow]] = await db.query(
              `SELECT DriverID FROM Drivers WHERE API_DriverID = ?`, 
              [driverData.driverId]
            );

            const [driverCheck] = await db.query(
              `SELECT * FROM Drivers WHERE API_DriverID = ?`, 
              [driverData.driverId]
            );

            if (!driverCheck.length) {
              console.error(`Driver with API_DriverID ${driverData.driverId} not found in DB`);
            }
            try {

              // Perform the insertion
              const [insertResult] = await db.query(
                `INSERT INTO Results (RaceID, DriverID, Position, Points, LapsCompleted, FastestLapTime, Status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                   Position = VALUES(Position), 
                   Points = VALUES(Points), 
                   LapsCompleted = VALUES(LapsCompleted), 
                   FastestLapTime = VALUES(FastestLapTime), 
                   Status = VALUES(Status);`,
                [
                  raceID,
                  driverRow.DriverID,
                  result.position || null,
                  result.points || 0,
                  result.laps || 0,
                  result.FastestLap?.Time?.time || null,
                  result.status || null, // Ensure `status` is fetched from API or assigned appropriately
                ]
              );
              
            } catch (error) {
              console.error(`Database insertion error for ${raceName}:`, error.message);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch results for ${raceName} (${date}): ${error.message}`);
        }
      }
// Fetch all drivers along with their names from the database
const [driverRows] = await db.query(`
  SELECT DriverID, API_DriverID, FirstName, LastName 
  FROM Drivers
`);

if (!driverRows.length) {
  console.error("No drivers found in the database.");
  return;
}

// Iterate through drivers in the database, ensuring proper IDs
for (const driverRow of driverRows) {
  const driverID = driverRow.DriverID;
  const driverName = `${driverRow.FirstName} ${driverRow.LastName}`;

  // Encode driver name properly for URL formatting
const driverId = encodeURIComponent(driverRow.API_DriverID.toLowerCase());
const standingsUrl = `https://api.jolpi.ca/ergast/f1/${year}/drivers/${driverId}/driverstandings.json`;

console.log(`📡 Fetching standings from: ${standingsUrl}`);

// Define points and position before the try block
let points = 0; // Ensure it's always defined
let position = null;

try {
  const { data } = await axios.get(standingsUrl);
  const standingsLists = data?.MRData?.StandingsTable?.StandingsLists || [];

  const driverStanding = standingsLists.length > 0 && standingsLists[0].DriverStandings.length > 0
    ? standingsLists[0].DriverStandings[0]
    : null;

  if (driverStanding) {
    points = parseInt(driverStanding.points, 10) || 0; // Convert points to an integer safely
    position = parseInt(driverStanding.position, 10) || null; // Convert position safely

    console.log(`📊 ${driverRow.FirstName} ${driverRow.LastName} (${year}) -> Position: ${position}, Points: ${points}`);
  } else {
    console.warn(`⚠️ No standings found for ${driverRow.FirstName} ${driverRow.LastName} (${year})`);
  }
} catch (error) {
  console.error(`❌ Failed to fetch standings for ${driverRow.FirstName} ${driverRow.LastName} (${year}): ${error.message}`);
  points = 0; // Set default to prevent undefined errors
}

  // Fetch positions and statuses for filtering
  const [positionsQueryResult] = await db.query(
    `SELECT Races.Track, Results.Position, Results.Status, Results.RaceID
     FROM Results 
     JOIN Races ON Results.RaceID = Races.RaceID
     WHERE Races.SeasonID = ? AND Results.DriverID = ? 
     ORDER BY Races.RoundNo ASC`, 
    [seasonID, driverID]
  );


  if (!positionsQueryResult.length) {
    console.warn(`No race data found for Driver ${driverName}`);
    console.log(`Driver ${driverName} (${driverID}) has Pc: NaN`);
    continue;
  }

  // Filter out invalid positions (e.g., due to mechanical issues or DNFs)
  const validPositions = positionsQueryResult
    .filter(row => row.Position <= 15 || !["Engine", "Power Unit", "Brakes", "Collision damage", "Retired", "Fuel leak", "Overheating", "Mechanical", "Disqualified", "Water pressure"].includes(row.Status))
    .map(row => row.Position);

  console.log(`Positions for Driver ${driverName} (${driverID}):`);
  positionsQueryResult.forEach(row => {
    const statusNote = ["Engine", "Power Unit", "Brakes", "Collision damage", "Retired", "Fuel leak", "Overheating", "Mechanical", "Disqualified", "Water pressure"].includes(row.Status) ? ` (Ignored: ${row.Status})` : "";
    console.log(`- Track: ${row.Track}, Position: ${row.Position}${statusNote}`);
  });

  if (!validPositions.length) {
    console.warn(`No valid race data for Driver ${driverName}`);
    console.log(`Driver ${driverName} (${driverID}) has Pc: NaN`);
    continue;
  }

  // Calculate Pc with filtered positions
  const n = validPositions.length;
  const sumpos = validPositions.reduce((sum, pos) => sum + pos, 0);
  const sumpos2 = validPositions.reduce((sum, pos) => sum + pos ** 2, 0);
  const sumr = validPositions.length > 0 ? 
  [...Array(validPositions.length).keys()].reduce((sum, r) => sum + (r + 1), 0) : 0;
  const sumrp = validPositions.length > 0 ? 
  validPositions.reduce((sum, pos, i) => sum + (i + 1) * pos, 0) : 0;


console.log(`📡 Fetching standings from: ${standingsUrl}`);

try {
  const { data } = await axios.get(standingsUrl);
  const standingsLists = data?.MRData?.StandingsTable?.StandingsLists || [];

  const driverStanding = standingsLists.length > 0 && standingsLists[0].DriverStandings.length > 0
    ? standingsLists[0].DriverStandings[0]
    : null;

// 🔥 FIX: Move `points` definition here so it exists in all cases
let points = 0;
let position = null;  // Ensure position is also defined

if (driverStanding) {
  points = parseInt(driverStanding.points, 10) || 0; // Ensure points is a number
  position = parseInt(driverStanding.position, 10) || null;
  console.log(`📊 ${driverRow.FirstName} ${driverRow.LastName} (${year}) -> Position: ${position}, Points: ${points}`);
} else {
  console.warn(`⚠️ No standings found for ${driverRow.FirstName} ${driverRow.LastName} (${year})`);
}

} catch (error) {
  console.error(`❌ Failed to fetch standings for ${driverRow.FirstName} ${driverRow.LastName} (${year}): ${error.message}`);
  points = 0; // ✅ Ensure points is **always** defined
}

  
  try {
    const Pc = calculatePc(sumpos, sumpos2, n) || 0;  // Ensure it's a number
    const Pt = calculatePt(validPositions) || 0;      // Ensure it's a number
    const Pa = calculatePa(points, position, driverRows.length) || 0
    console.log(`Driver ${driverName} (${driverID}) has Pc: ${Pc}, Pt: ${Pt}, and Pa: ${Pa}`);

    const updateQuery = (`
      INSERT INTO PerformanceMetrics (DriverID, SeasonID, PConsistency, PTrajectory, PAbsolute)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        PConsistency = VALUES(PConsistency), 
        PTrajectory = VALUES(PTrajectory), 
        PAbsolute = VALUES(PAbsolute);
    `);
    const [result] = await db.query(updateQuery, [driverID, seasonID, Pc, Pt, Pa]);
  } catch (error) {
    console.error(`Error calculating Pc for Driver ${driverName} (${driverID}): ${error.message}`);
  }
}
    }
    console.log("Database update completed.");
  } catch (error) {
    console.error("Error updating database:", error);
  }
}
// Fetch Pc for a specific year or all years
app.get("/Pc", async (req, res) => {
  const { year } = req.query;

  try {
    // Fetch seasons based on the provided year or all years
    const seasonQuery = year
      ? `SELECT SeasonID, Year FROM Seasons WHERE Year = ?`
      : `SELECT SeasonID, Year FROM Seasons`;
    const [seasonRows] = year
      ? await db.query(seasonQuery, [year])
      : await db.query(seasonQuery);

    if (seasonRows.length === 0) {
      return res.status(404).json({ message: `No data found for year ${year || "all years"}` });
    }

    const PcResults = [];

    for (const season of seasonRows) {
      const { SeasonID, Year } = season;

      // Fetch all drivers for this season
      const [driverRows] = await db.query(
        `SELECT DriverID, FirstName, LastName FROM Drivers`
      );
      
      for (const driverRow of driverRows) {
        const { DriverID, FirstName, LastName } = driverRow;
        const driverName = `${FirstName} ${LastName}`;

        // Fetch positions and statuses for the driver in this season
        const [positionsQueryResult] = await db.query(
          `SELECT Results.Position, Results.Status, Races.Track 
           FROM Results
           JOIN Races ON Results.RaceID = Races.RaceID
           WHERE Races.SeasonID = ? AND Results.DriverID = ?
           ORDER BY Races.RoundNo ASC`,
          [SeasonID, DriverID]
        );

        // Define statuses to ignore
        const ignoredStatuses = [
          "Engine", "Power Unit", "Brakes", "Collision damage", "Retired",
          "Fuel leak", "Overheating", "DNF", "Disqualified", "Water pressure", "Mechanical"
        ];

        // Filter valid positions based on status
        const validPositions = positionsQueryResult
          .filter(row => 
            row.Position > 0 && row.Position <= 20 && // Valid position range
            !ignoredStatuses.includes((row.Status || "").toLowerCase()) // Exclude ignored statuses
          )
          .map(row => row.Position);

        // Log ignored positions for debugging
        positionsQueryResult.forEach(row => {
          const statusNote = ignoredStatuses.includes((row.Status || "").toLowerCase()) 
            ? ` (Ignored: ${row.Status})` 
            : "";
          console.log(`- Track: ${row.Track}, Position: ${row.Position}${statusNote}`);
        });

        if (validPositions.length === 0) {
          console.log(`No valid data for Driver ${driverName} (${DriverID}) in Year ${Year}`);
          continue;
        }

        // Calculate Pc
        const n = validPositions.length;
        const sumpos = validPositions.reduce((sum, pos) => sum + pos, 0);
        const sumpos2 = validPositions.reduce((sum, pos) => sum + pos ** 2, 0);
        const sumr = validPositions.length > 0 ? 
        [...Array(validPositions.length).keys()].reduce((sum, r) => sum + (r + 1), 0) : 0;
        for (let i = 0; i < validPositions.length; i++) {
        }

      

        const standingsResponse = await axios.get(`
          https://api.jolpi.ca/ergast/f1/${Year}/drivers/${LastName.toLowerCase()}/driverstandings.json
        `);
        const standingsData = standingsResponse?.data?.MRData?.StandingsTable?.StandingsLists?.DriversStandings?.position || [];
        const points = standingsResponse?.data?.MRData?.StandingsTable?.StandingsLists?.DriversStandings?.points || [];
        console.log(`Calculating Pc with values: sumr=${sumr}, sumpos=${sumpos}, sumpos2=${sumpos2}, points=${points}, standing = ${standingsData}` );
        
      const sumrp = validPositions.length > 0 ? 
        validPositions.reduce((sum, pos, i) => sum + (i + 1) * pos, 0) : 0;
       
        console.log(`Calculating Pt with values: sumr=${sumr}, sumpos=${sumpos}, sumrp=${sumrp}, points=${points}, standing = ${standingsData}` );

        const Pc = calculatePc(sumpos, sumpos2, n);
        const Pt = calculatePt(validPositions);
        const Pa = calculatePa(points, standingsData, driverRows.length);

        PcResults.push({
          driver: driverName,
          year: Year,
          Pc: Pc,
          Pt: Pt,
          Pa: Pa,
          positions: validPositions,
        });

        console.log(
          `Driver ${driverName} (${DriverID}) in Year ${Year} has Pc: ${Pc} and Pt: ${Pt } and Pa: ${Pa}`
        );
      }
    }

    // Return the results
    res.json(PcResults);
  } catch (error) {
    console.error("Error fetching Pc data:", error);
    res.status(500).json({ error: "Failed to calculate Pc" });
  }
});


// Basic API endpoint
app.get("/drivers", async (req, res) => {
  try {
    await updateDB();
    res.json({ message: "DB updated" });
  } catch (error) {
    console.error("Error fetching data from API:", error);
    res.status(500).json({ error: "Database update failed" });
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
  const Pc = 1 - Math.min(1, (std / 4) ** 2) + 0.2;
  return Math.max(0, Math.min(1, Pc));
}

function calculatePa(pDriver, standing, totalDrivers){
  return 0.4 * (pDriver / 648) +  0.4 * (1 - (standing - 1) / Math.max(totalDrivers - 1, 1));
}


function calculatePt(positions) {
  if (!Array.isArray(positions) || positions.length < 8) {
    console.warn("⚠️ Pt calculation skipped due to insufficient data");
    return 0.5;  // Neutral trajectory if not enough races
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
  console.log(`DEBUG: LongTermTrend=${longTermTrend}, MidTermTrend=${midTermTrend}, Final Pt=${Pt}`);

  return Number((Math.max(0, Math.min(1, Pt))).toPrecision(2));
}


// Pagg is the aggregate performance metric
function calculatePagg(Pr, Pc, Pt, Pa) {
  if (Pr === undefined || Pc === undefined || Pt === undefined || Pa === undefined) {
    console.warn("Invalid input for Pagg calculation");
    return null;
  }
  return Math.floor((0.3 * Pr) + (0.22 * Pt) + (0.22 * Pa) + (0.18 * Pc));
}

