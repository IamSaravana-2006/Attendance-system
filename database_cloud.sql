-- ============================================
-- ATTENDANCE MANAGEMENT SYSTEM
-- CLOUD MYSQL SCHEMA (for Vercel deployment)
-- Run this on your cloud MySQL database
-- (e.g., Railway, PlanetScale, Aiven, Clever Cloud)
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    gender ENUM('Male', 'Female', 'Other'),
    department_id INT,
    year INT,
    section VARCHAR(10),
    admission_date DATE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL
);

-- 4. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Leave')
        NOT NULL DEFAULT 'Absent',
    check_in TIME,
    check_out TIME,
    remarks VARCHAR(255),
    marked_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,
    FOREIGN KEY (marked_by)
        REFERENCES users(id)
        ON DELETE SET NULL,
    UNIQUE (student_id, attendance_date)
);

-- 5. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason VARCHAR(255),
    status ENUM('Pending', 'Approved', 'Rejected')
        DEFAULT 'Pending',
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,
    FOREIGN KEY (approved_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- 6. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255)
);

-- INSERT USERS (admin & staff)
INSERT IGNORE INTO users
(username, password, full_name, role)
VALUES
('admin', 'admin123', 'Administrator', 'admin'),
('staff', 'staff123', 'Staff User', 'staff');

-- INSERT DEPARTMENTS (4 CORE DEPARTMENTS)
INSERT IGNORE INTO departments (id, department_name)
VALUES
(1, 'Computer Science & Engineering (CSE)'),
(2, 'Artificial Intelligence & Data Science (AIDS)'),
(3, 'Biomedical Engineering (BME)'),
(4, 'Mechanical Engineering (MECH)');

-- INSERT STUDENTS (sample data)
INSERT IGNORE INTO students
(student_code, name, email, phone, gender,
 department_id, year, section, admission_date)
VALUES
('ST001', 'Arun Kumar', 'arun@gmail.com',
 '9876543210', 'Male', 1, 3, 'A', '2024-06-10'),
('ST002', 'Ravi Kumar', 'ravi@gmail.com',
 '9876543211', 'Male', 1, 3, 'A', '2024-06-10'),
('ST003', 'Priya', 'priya@gmail.com',
 '9876543212', 'Female', 2, 2, 'B', '2025-06-10'),
('ST004', 'Karthik', 'karthik@gmail.com',
 '9876543213', 'Male', 3, 1, 'A', '2026-06-10'),
('ST005', 'Dinesh', 'dinesh@gmail.com',
 '9876543214', 'Male', 4, 4, 'A', '2023-06-10');

-- DEFAULT SETTINGS
INSERT IGNORE INTO settings
(setting_name, setting_value)
VALUES
('college_name', 'My College'),
('attendance_start_time', '09:00'),
('attendance_end_time', '17:00'),
('minimum_attendance', '75');