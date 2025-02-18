CREATE TABLE `Drivers` (
  `DriverID` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique driver ID',
  `RacingNumber` INT,
  `Increment` INT,
  `FirstName` VARCHAR(100),
  `LastName` VARCHAR(100),
  `Country` VARCHAR(100)
);

CREATE TABLE `Races` (
  `RaceID` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique race ID',
  `RoundNo` INT,
  `Track` VARCHAR(100),
  `Date` DATE,
  `SafetyIncidents` INT
);

CREATE TABLE `Seasons` (
  `SeasonID` INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique season ID',
  `Year` INT UNIQUE COMMENT 'Season year like 2022, 2023, etc.',
  `NoRounds` INT
);

CREATE TABLE `SeasonRaces` (
  `SeasonRaceID` INT PRIMARY KEY AUTO_INCREMENT,
  `SeasonID` INT,
  `RaceID` INT
);

CREATE TABLE `Results` (
  `ResultID` INT PRIMARY KEY AUTO_INCREMENT,
  `RaceID` INT,
  `DriverID` INT,
  `Position` INT,
  `Points` INT,
  `LapsCompleted` INT,
  `Condition` VARCHAR(10) COMMENT 'Finished, Retired, DNF'
);

CREATE TABLE `PerformanceMetrics` (
  `MetricID` INT PRIMARY KEY AUTO_INCREMENT,
  `DriverID` INT,
  `SeasonID` INT,
  `ConsistencyScore` FLOAT,
  `StandingsScore` FLOAT,
  `TrajectoryScore` FLOAT,
  `SafetyScore` FLOAT,
  `TeammateComparisonScore` FLOAT
);

CREATE TABLE `PValueAggregates` (
  `PValueID` INT PRIMARY KEY AUTO_INCREMENT,
  `DriverID` INT,
  `SeasonID` INT,
  `PValueScore` FLOAT
);

ALTER TABLE `SeasonRaces` ADD FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`);

ALTER TABLE `SeasonRaces` ADD FOREIGN KEY (`RaceID`) REFERENCES `Races` (`RaceID`);

ALTER TABLE `Results` ADD FOREIGN KEY (`RaceID`) REFERENCES `Races` (`RaceID`);

ALTER TABLE `Results` ADD FOREIGN KEY (`DriverID`) REFERENCES `Drivers` (`DriverID`);

ALTER TABLE `PerformanceMetrics` ADD FOREIGN KEY (`DriverID`) REFERENCES `Drivers` (`DriverID`);

ALTER TABLE `PerformanceMetrics` ADD FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`);

ALTER TABLE `PValueAggregates` ADD FOREIGN KEY (`DriverID`) REFERENCES `Drivers` (`DriverID`);

ALTER TABLE `PValueAggregates` ADD FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`);
