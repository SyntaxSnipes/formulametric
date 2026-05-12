-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: FormulaMetric
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Drivers`
--

DROP TABLE IF EXISTS `Drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Drivers` (
  `DriverID` int NOT NULL AUTO_INCREMENT COMMENT 'Unique driver ID',
  `RacingNumber` int DEFAULT NULL,
  `FirstName` varchar(100) DEFAULT NULL,
  `LastName` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `API_DriverID` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`DriverID`),
  UNIQUE KEY `API_DriverID` (`API_DriverID`),
  KEY `idx_apidriverid` (`API_DriverID`),
  KEY `idx_racingnumber` (`RacingNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PerformanceMetrics`
--

DROP TABLE IF EXISTS `PerformanceMetrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PerformanceMetrics` (
  `MetricID` int NOT NULL AUTO_INCREMENT,
  `DriverID` int NOT NULL,
  `SeasonID` int NOT NULL,
  `PConsistency` float NOT NULL,
  `PTrajectory` float NOT NULL,
  `PRelative` float DEFAULT NULL,
  `PAbsolute` float DEFAULT NULL,
  `PAggregate` float DEFAULT NULL,
  PRIMARY KEY (`MetricID`),
  UNIQUE KEY `uq_driver_season` (`DriverID`,`SeasonID`),
  KEY `fk_pm_season` (`SeasonID`),
  CONSTRAINT `fk_pm_driver` FOREIGN KEY (`DriverID`) REFERENCES `Drivers` (`DriverID`),
  CONSTRAINT `fk_pm_season` FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Races`
--

DROP TABLE IF EXISTS `Races`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Races` (
  `RaceID` int NOT NULL AUTO_INCREMENT,
  `Track` varchar(100) NOT NULL,
  `Date` date NOT NULL,
  `RoundNo` int NOT NULL,
  `SeasonID` int NOT NULL,
  PRIMARY KEY (`RaceID`),
  UNIQUE KEY `unique_race` (`Track`,`Date`,`SeasonID`),
  KEY `idx_seasonid` (`SeasonID`),
  CONSTRAINT `FK_SeasonID` FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Results`
--

DROP TABLE IF EXISTS `Results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Results` (
  `ResultID` int NOT NULL AUTO_INCREMENT,
  `RaceID` int NOT NULL,
  `DriverID` int NOT NULL,
  `Position` int DEFAULT NULL,
  `Points` int DEFAULT NULL,
  `LapsCompleted` int DEFAULT NULL,
  `FastestLapTime` varchar(10) DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `SeasonID` int NOT NULL,
  PRIMARY KEY (`ResultID`),
  UNIQUE KEY `unique_result` (`DriverID`,`RaceID`),
  KEY `idx_driverid` (`DriverID`),
  KEY `idx_raceid` (`RaceID`),
  KEY `FK_Results_Season` (`SeasonID`),
  CONSTRAINT `FK_Results_Driver` FOREIGN KEY (`DriverID`) REFERENCES `Drivers` (`DriverID`),
  CONSTRAINT `FK_Results_Race` FOREIGN KEY (`RaceID`) REFERENCES `Races` (`RaceID`),
  CONSTRAINT `FK_Results_Season` FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`),
  CONSTRAINT `Results_ibfk_1` FOREIGN KEY (`RaceID`) REFERENCES `Races` (`RaceID`),
  CONSTRAINT `Results_ibfk_2` FOREIGN KEY (`DriverID`) REFERENCES `Drivers` (`DriverID`)
) ENGINE=InnoDB AUTO_INCREMENT=1839 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SeasonRaces`
--

DROP TABLE IF EXISTS `SeasonRaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SeasonRaces` (
  `SeasonRaceID` int NOT NULL AUTO_INCREMENT,
  `SeasonID` int NOT NULL,
  `RaceID` int NOT NULL,
  PRIMARY KEY (`SeasonRaceID`),
  UNIQUE KEY `SeasonID` (`SeasonID`,`RaceID`),
  KEY `RaceID` (`RaceID`),
  CONSTRAINT `SeasonRaces_ibfk_1` FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`),
  CONSTRAINT `SeasonRaces_ibfk_2` FOREIGN KEY (`RaceID`) REFERENCES `Races` (`RaceID`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Seasons`
--

DROP TABLE IF EXISTS `Seasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Seasons` (
  `SeasonID` int NOT NULL AUTO_INCREMENT,
  `Year` int NOT NULL,
  `NoRounds` int DEFAULT NULL,
  PRIMARY KEY (`SeasonID`),
  UNIQUE KEY `Year` (`Year`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Teams`
--

DROP TABLE IF EXISTS `Teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Teams` (
  `TeamID` int NOT NULL AUTO_INCREMENT,
  `TeamName` varchar(100) NOT NULL,
  `SeasonID` int NOT NULL,
  `Teammate1_ID` int DEFAULT NULL,
  `Teammate2_ID` int DEFAULT NULL,
  `AdditionalDriver1_ID` int DEFAULT NULL,
  `AdditionalDriver2_ID` int DEFAULT NULL,
  PRIMARY KEY (`TeamID`),
  UNIQUE KEY `uq_team_per_season` (`TeamName`,`SeasonID`),
  KEY `FK_Teams_Season` (`SeasonID`),
  KEY `FK_Teams_Teammate1` (`Teammate1_ID`),
  KEY `FK_Teams_Teammate2` (`Teammate2_ID`),
  CONSTRAINT `FK_Teams_Season` FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`),
  CONSTRAINT `FK_Teams_Teammate1` FOREIGN KEY (`Teammate1_ID`) REFERENCES `Drivers` (`DriverID`),
  CONSTRAINT `FK_Teams_Teammate2` FOREIGN KEY (`Teammate2_ID`) REFERENCES `Drivers` (`DriverID`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-12 17:56:34
