// these are some of the imports we need, dotenv is for loading the env file, axios is for making request to the api, cron is for scheduling update of db
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mysql from "mysql2/promise";
import axios from "axios";
import cors from "cors";
import { abs, sqrt, floor, e, re } from "mathjs";

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
        let SafetyIncidents = 0;
        const raceSQLQuery = `
        INSERT INTO Races (RoundNo, Track, Date, SafetyIncidents, SeasonID)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            RoundNo = VALUES(RoundNo),
            Track = VALUES(Track),
            Date = VALUES(Date),
            SafetyIncidents = VALUES(SafetyIncidents),
            SeasonID = VALUES(SeasonID);
        `;
        await db.query(raceSQLQuery, [round, raceName, date, SafetyIncidents, seasonID]);
        
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
              if (!driverRow) {
                console.error(`Driver not found: ${driverData.driverId}`);
                continue;
              }

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
          const updateQuery =`
            UPDATE Races SET SafetyIncidents = ? WHERE RaceID = ? AND Date = ?;
          `;
          await db.query(updateQuery, [SafetyIncidents, raceID, date]);
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
  const sump = validPositions.reduce((sum, pos) => sum + pos, 0);
  const sump2 = validPositions.reduce((sum, pos) => sum + pos ** 2, 0);
  const sumr = validPositions.length > 0 ? 
  [...Array(validPositions.length).keys()].reduce((sum, r) => sum + (r + 1), 0) : 0;

const sumrp = validPositions.length > 0 ? 
  validPositions.reduce((sum, pos, i) => sum + (i + 1) * pos, 0) : 0;
  
  console.log(`Driver ${driverName} (${driverID}): sump=${sump}, sump2=${sump2}, n=${n}`);
  try {
    const Pc = calculatePc(sump, sump2, n);
    const Pt = calculatePt(sumr, sump, sumrp, n);
    console.log(`Driver ${driverName} (${driverID}) has Pc: ${Pc} and Pt: ${Pt}`);
    const updateQuery = (`
    INSERT INTO PerformanceMetrics (DriverID, SeasonID, PConsistency, PTrajectory)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE PConsistency = VALUES(PConsistency), PTrajectory = VALUES(PTrajectory);
    `);
    await db.query(updateQuery, [driverID, seasonID, Pc, Pt]);
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
        const sump = validPositions.reduce((sum, pos) => sum + pos, 0);
        const sump2 = validPositions.reduce((sum, pos) => sum + pos ** 2, 0);
        const sumr = validPositions.length > 0 ? 
        [...Array(validPositions.length).keys()].reduce((sum, r) => sum + (r + 1), 0) : 0;
      
      const sumrp = validPositions.length > 0 ? 
        validPositions.reduce((sum, pos, i) => sum + (i + 1) * pos, 0) : 0;
       
        console.log(`Calculating Pt with values: sumr=${sumr}, sump=${sump}, sumrp=${sumrp}`);

        const Pc = calculatePc(sump, sump2, n);
        const Pt = calculatePt(sumr, sump, sumrp, n);

        PcResults.push({
          driver: driverName,
          year: Year,
          Pc: Pc,
          Pt: Pt,
          positions: validPositions,
        });

        console.log(
          `Driver ${driverName} (${DriverID}) in Year ${Year} has Pc: ${Pc} and Pt: ${Pt}`
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
// sumr is the sum of races (ordinal), sump is the sum of race points acheived, sumrp is the sum of the product of race and points, sumr2 is the sum of the square and sump2 is the sum of the square of the points, n is the number of data points (typically number of races)
function calculatePc(sump, sump2, n) {
  if (sump === 0 || n === 0 || sump2 === 0) return 0;
  if (n<5) return null;

  // Calculate mean and standard deviation
  const mean = sump / n;
  const std = Math.sqrt(sump2 / n - mean ** 2);

  // Calculate Pc
  const Pc = 1/(1+(std/5));
  return Pc;
}

function calculatePa(pDriver, dnfDriver, noPodium, n){
  return 0.5 * (pDriver / 101) + 0.2 * (1 - dnfDriver / n) + 0.3 * (noPodium / n);
}


function calculatePt(sumr, sump, sumrp, n){
  if (sumr === 0 || sump === 0 || sumrp === 0) {
    console.warn("Invalid input for Pt calculation");
    return null;
  }
  let m = ((sumr * sump) - sumrp) / (n ** 1.05);
  m = Math.max(-15, Math.min(15, m));
  let rawScore = 0.5 - (0.1 * m);
  let scaledScore = Math.log1p(Math.abs(rawScore * 5)) / Math.log1p(5);
  console.log(`DEBUG: m=${m}, rawScore=${rawScore}, scaledScore=${scaledScore}`);
  return Math.max(0, Math.min(1, scaledScore));
}

// Pagg is the aggregate performance metric
function calculatePagg(Pr, Pc, Pt, Pa) {
  if (Pr === undefined || Pc === undefined || Pt === undefined || Pa === undefined) {
    console.warn("Invalid input for Pagg calculation");
    return null;
  }
  return Math.floor((0.3 * Pr) + (0.22 * Pt) + (0.22 * Pa) + (0.18 * Pc));
}

