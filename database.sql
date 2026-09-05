-- ============================================
-- ATTENDANCE MANAGEMENT SYSTEM
-- MYSQL COMPLETE DATABASE
-- ============================================

DROP DATABASE IF EXISTS attendance_app;

CREATE DATABASE attendance_app;

USE attendance_app;


-- ============================================
-- 1. USERS TABLE
-- ============================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 2. DEPARTMENTS TABLE
-- ============================================

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 3. STUDENTS TABLE
-- ============================================

CREATE TABLE students (
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


-- ============================================
-- 4. ATTENDANCE TABLE
-- ============================================

CREATE TABLE attendance (
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


-- ============================================
-- 5. LEAVE REQUESTS TABLE
-- ============================================

CREATE TABLE leave_requests (
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


-- ============================================
-- 6. SETTINGS TABLE
-- ============================================

CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255)
);


-- ============================================
-- INSERT USERS
-- ============================================

INSERT INTO users
(username, password, full_name, role)
VALUES
('admin', 'admin123', 'Administrator', 'admin'),
('staff', 'staff123', 'Staff User', 'staff');


-- ============================================
-- INSERT DEPARTMENTS (4 CORE DEPARTMENTS)
-- ============================================

INSERT INTO departments (id, department_name)
VALUES
(1, 'Computer Science & Engineering (CSE)'),
(2, 'Artificial Intelligence & Data Science (AIDS)'),
(3, 'Biomedical Engineering (BME)'),
(4, 'Mechanical Engineering (MECH)');


-- ============================================
-- INSERT STUDENTS
-- ============================================

INSERT INTO students
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


-- ============================================
-- INSERT TODAY ATTENDANCE
-- ============================================

INSERT INTO attendance
(student_id, attendance_date, status, check_in, marked_by)
VALUES
(1, CURDATE(), 'Present', '09:00:00', 1),
(2, CURDATE(), 'Absent', NULL, 1),
(3, CURDATE(), 'Late', '09:25:00', 1),
(4, CURDATE(), 'Present', '08:55:00', 1);


-- ============================================
-- DEFAULT SETTINGS
-- ============================================

INSERT INTO settings
(setting_name, setting_value)
VALUES
('college_name', 'My College'),
('attendance_start_time', '09:00'),
('attendance_end_time', '17:00'),
('minimum_attendance', '75');


-- ============================================
-- VIEW: STUDENT ATTENDANCE
-- ============================================

CREATE VIEW student_attendance_view AS
SELECT
    s.id AS student_id,
    s.student_code,
    s.name,
    d.department_name,
    s.year,
    s.section,
    a.attendance_date,
    a.status,
    a.check_in,
    a.check_out,
    a.remarks
FROM students s
LEFT JOIN departments d
    ON s.department_id = d.id
LEFT JOIN attendance a
    ON s.id = a.student_id;


-- ============================================
-- VIEW: ATTENDANCE SUMMARY
-- ============================================

CREATE VIEW attendance_summary AS
SELECT
    s.id AS student_id,
    s.student_code,
    s.name,

    COUNT(a.id) AS total_days,

    SUM(
        CASE
            WHEN a.status = 'Present' THEN 1
            ELSE 0
        END
    ) AS present_days,

    SUM(
        CASE
            WHEN a.status = 'Absent' THEN 1
            ELSE 0
        END
    ) AS absent_days,

    SUM(
        CASE
            WHEN a.status = 'Late' THEN 1
            ELSE 0
        END
    ) AS late_days,

    SUM(
        CASE
            WHEN a.status = 'Leave' THEN 1
            ELSE 0
        END
    ) AS leave_days,

    CASE
        WHEN COUNT(a.id) = 0 THEN 0
        ELSE ROUND(
            SUM(
                CASE
                    WHEN a.status = 'Present' THEN 1
                    WHEN a.status = 'Late' THEN 1
                    ELSE 0
                END
            ) * 100.0 / COUNT(a.id),
            2
        )
    END AS attendance_percentage

FROM students s

LEFT JOIN attendance a
    ON s.id = a.student_id

GROUP BY
    s.id,
    s.student_code,
    s.name;


-- ============================================
-- CHECK DATABASE
-- ============================================

SELECT 'Database Created Successfully!' AS message;

SELECT * FROM users;

SELECT * FROM departments;

SELECT * FROM students;

SELECT * FROM attendance;

SELECT * FROM attendance_summary;
