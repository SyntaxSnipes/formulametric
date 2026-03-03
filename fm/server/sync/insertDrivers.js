import {
  fetchDrivers,
  fetchDriverStandings,
} from "../services/jolpica.service.js";

//asynchronous function to insert all drivers for a season into the database
export async function insertAllDrivers(db, year) {
  //fetching the drivers for the season from the API
  const drivers = (await fetchDrivers(year)) ?? [];

  //looping through each driver and inserting them into the database
  for (const driver of drivers) {
    try {
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
    } catch (error) {
      console.error(
        `Database insertion error for driver ${driver.driverId}:`,
        error.message,
      );
    }
  }
  console.log(`Drivers updated for season ${year}`);

  //initalizing object that stores relationship between driver's API ID and the respective internal DB ID
  const driverMap = {};

  //query to fetch all drivers and their API IDs to loop through for mapping
  const [allDrivers] = await db.query(
    `SELECT API_DriverID, DriverID FROM Drivers`,
  );
  for (const d of allDrivers) {
    driverMap[d.API_DriverID] = d.DriverID;
  }

  //fetching driver standings to ensure all drivers from the season are included in the database
  const standingsResponse = await fetchDriverStandings(year);

  const standingsList = standingsResponse ?? []; //empty array if no standings data

  //inserting every driver from the standings into the database to ensure all drivers are included
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
