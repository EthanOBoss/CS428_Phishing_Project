CREATE TABLE IF NOT EXISTS `Client` (
    `ClientID` INT NOT NULL AUTO_INCREMENT,
    `ClientName` VARCHAR(45) NOT NULL,
    `ClientEmail` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ClientID`)
) ENGINE = InnoDB;

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

CREATE TABLE IF NOT EXISTS `Report` (
  `ReportID` INT NOT NULL AUTO_INCREMENT,
  `EmailContents` VARCHAR(500) NOT NULL,
  `EmployeeMessage` VARCHAR(200),
  `DateReported` DATETIME,
  `EmailSender` VARCHAR(255),
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