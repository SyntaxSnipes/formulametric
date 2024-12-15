CREATE DATABASE F1DB;

USE F1DB;

CREATE TABLE drivers (
    driverId VARCHAR(5) PRIMARY KEY,
    driverRef VARCHAR(255),
    num INT,
    abb VARCHAR(3),
    forename VARCHAR(255),
    surname VARCHAR(255),
    teamId INT,
    FOREIGN KEY(teamId) REFERENCES team(teamId),
    teamHistory VARCHAR(8),
    teammateId VARCHAR(5),
    FOREIGN KEY(teammateId) REFERENCES drivers(driverId),
);
CREATE TABLE team (
    teamId INT PRIMARY KEY,
    teamName VARCHAR(255),
    currentStanding INT,
    standings VARCHAR(14),
    driver1 VARCHAR(5),
    driver2 VARCHAR(5),
    FOREIGN KEY(driver1) REFERENCES drivers(driverId),
    FOREIGN KEY(driver2) REFERENCES drivers(driverId),
);

CREATE TABLE race (
    raceId INT PRIMARY KEY,
    seasonYear INT,
    locationName VARCHAR(255),
    circuitName VARCHAR(255),
    raceDate DATE,
)

CREATE TABLE results (
    raceId INT,
    driverId VARCHAR(5),
    finishPosition INT,
    points DECIMAL(3,1),
    raceStatus VARCHAR(3) -- the status for each will be either FIN, DSQ, DNF, DNS
    PRIMARY KEY (raceId, driverId),
    FOREIGN KEY (raceId) REFERENCES race(raceId),
    FOREIGN KEY (driverId) REFERENCES drivers(driverId),
)


