-- Job Junction - MySQL Schema
-- Run this manually OR use `npm run db:sync` (Sequelize auto-sync)

CREATE DATABASE IF NOT EXISTS job_junction CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_junction;

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(150) NOT NULL UNIQUE,
  mobile           VARCHAR(15),
  password         VARCHAR(255) NOT NULL,
  role             ENUM('job_seeker','employer','admin') DEFAULT 'job_seeker',
  profile_picture  VARCHAR(255),
  is_inactive      TINYINT(1) DEFAULT 0,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- JOB SEEKER PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  user_id              INT NOT NULL UNIQUE,
  headline             VARCHAR(200),
  bio                  TEXT,
  date_of_birth        DATE,
  gender               ENUM('male','female','other','prefer_not_to_say'),
  location             VARCHAR(150),
  resume               VARCHAR(255),
  profile_picture      VARCHAR(255),
  skills               JSON,
  languages            JSON,
  education            JSON,
  experience           JSON,
  job_type_preference  JSON,
  expected_salary      INT,
  completeness_score   INT DEFAULT 0,
  completeness_tier    ENUM('bronze','silver','gold','platinum') DEFAULT 'bronze',
  is_available         TINYINT(1) DEFAULT 1,
  is_inactive          TINYINT(1) DEFAULT 0,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- EMPLOYER PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employer_profiles (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE,
  company_name     VARCHAR(150) NOT NULL,
  company_logo     VARCHAR(255),
  company_website  VARCHAR(255),
  industry         VARCHAR(100),
  company_size     ENUM('1-10','11-50','51-200','201-500','501-1000','1000+'),
  founded_year     INT,
  about_company    TEXT,
  location         VARCHAR(150),
  social_links     JSON,
  is_verified      TINYINT(1) DEFAULT 0,
  is_inactive      TINYINT(1) DEFAULT 0,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- JOBS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  employer_id           INT NOT NULL,
  title                 VARCHAR(200) NOT NULL,
  description           TEXT NOT NULL,
  requirements          TEXT,
  responsibilities      TEXT,
  location              VARCHAR(150),
  job_type              ENUM('full_time','part_time','contract','internship','remote') NOT NULL,
  experience_level      ENUM('fresher','junior','mid','senior','lead'),
  salary_min            INT,
  salary_max            INT,
  salary_currency       VARCHAR(10) DEFAULT 'INR',
  skills_required       JSON,
  category              VARCHAR(100),
  vacancies             INT DEFAULT 1,
  application_deadline  DATE,
  status                ENUM('active','closed','draft') DEFAULT 'active',
  views                 INT DEFAULT 0,
  is_inactive           TINYINT(1) DEFAULT 0,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
  FULLTEXT INDEX ft_jobs (title, description)
);

-- ─────────────────────────────────────────────
-- APPLICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  job_id          INT NOT NULL,
  applicant_id    INT NOT NULL,
  resume          VARCHAR(255),
  cover_letter    TEXT,
  status          ENUM('applied','shortlisted','interview','rejected','hired') DEFAULT 'applied',
  employer_notes  TEXT,
  is_withdrawn    TINYINT(1) DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_application (job_id, applicant_id),
  FOREIGN KEY (job_id)       REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
);
