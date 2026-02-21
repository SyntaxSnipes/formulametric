import {
  fetchDrivers,
  fetchDriverStandings,
} from "../services/jolpica.service.js";

export async function insertAllDrivers(db, year) {
  const drivers = (await fetchDrivers(year)) ?? [];
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
  const driverMap = {};

  const [allDrivers] = await db.query(
    `SELECT API_DriverID, DriverID FROM Drivers`,
  );
  for (const d of allDrivers) {
    driverMap[d.API_DriverID] = d.DriverID;
  }

  const standingsResponse = await fetchDriverStandings(year);

  const standingsList = standingsResponse ?? [];

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
