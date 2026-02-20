-- MySQL Schema for Secure Result System

-- Database: result_system (or similar)

-- Table for storing exam results
CREATE TABLE IF NOT EXISTS `results` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `reg_no` VARCHAR(50) NOT NULL,
    `exam_id` VARCHAR(50) NOT NULL,
    `full_name` VARCHAR(255),
    `total_marks` DECIMAL(10,2),
    `status` VARCHAR(20),
    `data` JSON NOT NULL, -- Full student data object
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_reg_no` (`reg_no`),
    INDEX `idx_exam_id` (`exam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing site settings/metadata (if needed to replace JSON files)
CREATE TABLE IF NOT EXISTS `site_settings` (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` JSON NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
