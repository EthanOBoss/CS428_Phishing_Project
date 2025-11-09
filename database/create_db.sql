-- Create phising database
CREATE DATABASE IF NOT EXISTS phishdb;
USE phishdb;

-- Create the table for phising reports
CREATE TABLE IF NOT EXISTS phising_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eml_filename VARCHAR(255) DEFAULT NULL,
    eml_content LONGBLOB NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;