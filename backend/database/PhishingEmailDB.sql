--------------------------------------------------------------------------------------------
-- For testing, can be removed in the final version {
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
-- }
--------------------------------------------------------------------------------------------

-- -----------------------------------------------------
-- Table `Client`
-- -----------------------------------------------------

--------------------------------------------------------------------------------------------
-- For testing, can be removed in the final version {
DROP TABLE IF EXISTS `Client` ;
-- }
--------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Client` (
    `ClientID` INT NOT NULL AUTO_INCREMENT,
    `ClientName` VARCHAR(45) NOT NULL,
    `ClientEmail` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ClientID`)
) ENGINE = InnoDB;

--------------------------------------------------------------------------------------------
-- For testing, can be removed in the final version {
INSERT INTO `Client` (ClientName, ClientEmail)
VALUES 
    ('Client1', 'Client1@Client1.com'),
    ('Client2', 'Client2@Client2.com'),
    ('Client3', 'Client3@Client3.com');
-- }
--------------------------------------------------------------------------------------------

-- -----------------------------------------------------
-- Table `Employee`
-- -----------------------------------------------------

--------------------------------------------------------------------------------------------
-- For testing, can be removed in the final version {
DROP TABLE IF EXISTS `Employee` ;
-- }
--------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Employee` (
  `EmployeeID` INT NOT NULL AUTO_INCREMENT,
  `EmployeeEmail` VARCHAR(255) NOT NULL,
  `ClientID` INT NOT NULL,
  PRIMARY KEY (`EmployeeID`),
  INDEX `ClientID_idx` (`ClientID` ASC) VISIBLE,
  CONSTRAINT `Employee_ClientID`
    FOREIGN KEY (`ClientID`)
    REFERENCES `Client` (`ClientID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

--------------------------------------------------------------------------------------------
-- For testing, can be removed in the final version {
INSERT INTO `Employee` (EmployeeEmail, ClientID)
VALUES 
    ('Employee1@client1.com', 1),
    ('Employee2@client2.com', 2),
    ('Employee3@client3.com', 3);
-- }
--------------------------------------------------------------------------------------------

-- -----------------------------------------------------
-- Table `Report`
-- -----------------------------------------------------

--------------------------------------------------------------------------------------------
-- For testing, can be removed in the final version {
DROP TABLE IF EXISTS `Report` ;
-- }
--------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Report` (
  `ReportID` INT NOT NULL AUTO_INCREMENT,
  `EmailContents` VARCHAR(500) NOT NULL,
  `EmployeeMessage` VARCHAR(200),
  `DateReported` DATETIME NOT NULL,
  `EmailSender` VARCHAR(255) NOT NULL,
  `Reviewed` BOOLEAN DEFAULT FALSE,
  `EmployeeID` INT NOT NULL,
  `ClientID` INT NOT NULL,
  PRIMARY KEY (`ReportID`),
  INDEX `EmployeeID_idx` (`EmployeeID` ASC) VISIBLE,
  INDEX `ClientID_idx` (`ClientID` ASC) VISIBLE,
  CONSTRAINT `Report_EmployeeID`
    FOREIGN KEY (`EmployeeID`)
    REFERENCES `Employee` (`EmployeeID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `Report_ClientID`
    FOREIGN KEY (`ClientID`)
    REFERENCES `Client` (`ClientID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

--------------------------------------------------------------------------------------------
-- For testing, can be removed in the final version {
INSERT INTO `Employee` (EmailContents, DateReported, EmailSender, EmployeeID, ClientID)
VALUES 
    ('Malicious email stuff', '2025-11-20 08:05:12', "totallylegit@gmail.com",  1, 1),
    ('I am a prince give me money', '2025-11-20 09:05:12', "notahacker@gmail.com", 2, 2),
    ('What is your password', '2025-11-20 10:05:12', "princeofpersia@gmail.com", 3, 3);
-- }
--------------------------------------------------------------------------------------------

--------------------------------------------------------------------------------------------
-- For testing, can be removed in the final version {
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
-- }
--------------------------------------------------------------------------------------------