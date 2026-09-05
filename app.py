from flask import Flask, request, jsonify, render_template, session, redirect
import mysql.connector
from functools import wraps

app = Flask(__name__)
import os

print("APP FOLDER:", os.getcwd())
print("TEMPLATES:", os.path.abspath("templates"))
print(
    "STUDENTS EXISTS:",
    os.path.exists(
        os.path.join("templates", "students.html")
    )
)

app.secret_key = "attendance_secret_key"


# ==========================================
# MYSQL CONNECTION
# ==========================================

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="avce123",
        database="attendance_app"
    )


# ==========================================
# LOGIN REQUIRED
# ==========================================

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "Login required"
            }), 401

        return f(*args, **kwargs)

    return decorated_function


# ==========================================
# PAGES
# ==========================================

@app.route("/")
def index():
    return redirect("/login")


@app.route("/login")
def login_page():
    return render_template("login.html")


@app.route("/dashboard")
def dashboard_page():
    if "user_id" not in session:
        return redirect("/login")

    return render_template("dashboard.html")


@app.route("/students")
def students_page():
    if "user_id" not in session:
        return redirect("/login")

    return render_template("students.html")


@app.route("/attendance")
def attendance_page():
    if "user_id" not in session:
        return redirect("/login")

    return render_template("attendance.html")


# ==========================================
# LOGIN API
# ==========================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password required"
        })

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM users
        WHERE username = %s
        AND password = %s
    """, (username, password))

    user = cursor.fetchone()

    cursor.close()
    db.close()

    if user:

        session["user_id"] = user["id"]
        session["username"] = user["username"]
        session["role"] = user["role"]

        return jsonify({
            "success": True,
            "message": "Login successful"
        })

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    })


# ==========================================
# LOGOUT
# ==========================================

@app.route("/api/logout")
def logout():
    session.clear()
    return jsonify({
        "success": True,
        "message": "Logged out"
    })


# ==========================================
# CURRENT USER INFO
# ==========================================

@app.route("/api/me")
def get_current_user():
    if "user_id" not in session:
        return jsonify({"success": False, "logged_in": False}), 401

    return jsonify({
        "success": True,
        "logged_in": True,
        "user_id": session.get("user_id"),
        "username": session.get("username"),
        "role": session.get("role")
    })


# ==========================================
# 4 DEPARTMENTS API
# ==========================================

@app.route("/api/departments", methods=["GET"])
@login_required
def get_departments():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, department_name
        FROM departments
        ORDER BY id ASC
    """)
    departments = cursor.fetchall()
    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "departments": departments
    })


# ==========================================
# DASHBOARD API
# ==========================================

@app.route("/api/dashboard")
@login_required
def dashboard():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Total active students
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM students
        WHERE status = 'Active'
    """)
    total_students = cursor.fetchone()["total"]

    # Present today
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM attendance
        WHERE attendance_date = CURDATE()
        AND status = 'Present'
    """)
    present = cursor.fetchone()["total"]

    # Absent today
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM attendance
        WHERE attendance_date = CURDATE()
        AND status = 'Absent'
    """)
    absent = cursor.fetchone()["total"]

    # Late today
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM attendance
        WHERE attendance_date = CURDATE()
        AND status = 'Late'
    """)
    late = cursor.fetchone()["total"]

    # Department-wise student counts for the 4 departments
    cursor.execute("""
        SELECT
            d.id,
            d.department_name,
            COUNT(s.id) AS student_count
        FROM departments d
        LEFT JOIN students s
            ON d.id = s.department_id AND s.status = 'Active'
        GROUP BY d.id, d.department_name
        ORDER BY d.id ASC
    """)
    department_stats = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "user": {
            "username": session.get("username"),
            "role": session.get("role")
        },
        "total_students": total_students,
        "present": present,
        "absent": absent,
        "late": late,
        "department_stats": department_stats
    })


# ==========================================
# GET STUDENTS (Supports Department Filter)
# ==========================================

@app.route("/api/students", methods=["GET"])
@login_required
def get_students():
    dept_id = request.args.get("department_id")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    if dept_id and dept_id.isdigit():
        cursor.execute("""
            SELECT
                s.id,
                s.student_code,
                s.name,
                s.email,
                s.phone,
                s.gender,
                s.year,
                s.section,
                s.department_id,
                s.status,
                d.department_name
            FROM students s
            LEFT JOIN departments d
            ON s.department_id = d.id
            WHERE s.department_id = %s
            ORDER BY s.id DESC
        """, (int(dept_id),))
    else:
        cursor.execute("""
            SELECT
                s.id,
                s.student_code,
                s.name,
                s.email,
                s.phone,
                s.gender,
                s.year,
                s.section,
                s.department_id,
                s.status,
                d.department_name
            FROM students s
            LEFT JOIN departments d
            ON s.department_id = d.id
            ORDER BY s.id DESC
        """)

    students = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "students": students
    })


# ==========================================
# ADD SINGLE STUDENT (MANUAL)
# ==========================================

@app.route("/api/students", methods=["POST"])
@login_required
def add_student():
    data = request.get_json()

    student_code = data.get("student_code")
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    gender = data.get("gender")
    department_id = data.get("department_id")
    year = data.get("year")
    section = data.get("section")

    if not student_code or not name or not department_id:
        return jsonify({
            "success": False,
            "message": "Student code, name, and department are required"
        }), 400

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("""
            INSERT INTO students
            (
                student_code,
                name,
                email,
                phone,
                gender,
                department_id,
                year,
                section,
                status
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'Active')
        """, (
            student_code.strip(),
            name.strip(),
            email.strip() if email else None,
            phone.strip() if phone else None,
            gender if gender else None,
            department_id,
            year if year else 1,
            section.strip().upper() if section else 'A'
        ))

        db.commit()

        return jsonify({
            "success": True,
            "message": "Student added successfully"
        })

    except mysql.connector.Error as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    finally:
        cursor.close()
        db.close()


# ==========================================
# BULK ADD STUDENT NAMES (MANUAL LIST ENTRY)
# ==========================================

@app.route("/api/students/bulk", methods=["POST"])
@login_required
def bulk_add_students():
    data = request.get_json()

    department_id = data.get("department_id")
    year = data.get("year", 1)
    section = data.get("section", "A")
    names = data.get("names", [])

    if not department_id:
        return jsonify({
            "success": False,
            "message": "Department is required"
        }), 400

    if not names or not isinstance(names, list):
        return jsonify({
            "success": False,
            "message": "A list of student names is required"
        }), 400

    cleaned_names = [n.strip() for n in names if n and n.strip()]
    if not cleaned_names:
        return jsonify({
            "success": False,
            "message": "No valid student names provided"
        }), 400

    dept_prefixes = {1: "CSE", 2: "AIDS", 3: "BME", 4: "MECH"}
    prefix = dept_prefixes.get(int(department_id), "ST")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        # Get count of existing students in this department to generate neat roll numbers
        cursor.execute("SELECT COUNT(*) AS total FROM students WHERE department_id = %s", (department_id,))
        start_count = cursor.fetchone()["total"]

        added_students = []
        for i, student_name in enumerate(cleaned_names):
            roll_num = start_count + i + 1
            code = f"{prefix}{str(roll_num).zfill(3)}"

            # Ensure uniqueness
            cursor.execute("SELECT id FROM students WHERE student_code = %s", (code,))
            if cursor.fetchone():
                code = f"{prefix}{str(roll_num).zfill(3)}_{i+1}"

            cursor.execute("""
                INSERT INTO students (student_code, name, department_id, year, section, status)
                VALUES (%s, %s, %s, %s, %s, 'Active')
            """, (code, student_name, department_id, year, section.strip().upper() if section else 'A'))

            added_students.append({"code": code, "name": student_name})

        db.commit()

        return jsonify({
            "success": True,
            "message": f"Successfully added {len(added_students)} students!",
            "count": len(added_students),
            "students": added_students
        })

    except mysql.connector.Error as e:
        db.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        db.close()


# ==========================================
# DELETE STUDENT
# ==========================================

@app.route("/api/students/<int:student_id>", methods=["DELETE"])
@login_required
def delete_student(student_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        DELETE FROM students
        WHERE id = %s
    """, (student_id,))

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Student deleted"
    })


# ==========================================
# GET ATTENDANCE (Supports Date & Department Filter)
# ==========================================

@app.route("/api/attendance", methods=["GET"])
@login_required
def get_attendance():
    date = request.args.get("date")
    dept_id = request.args.get("department_id")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    date_clause = "CURDATE()" if not date else "%s"

    query = f"""
        SELECT
            s.id,
            s.student_code,
            s.name,
            s.department_id,
            d.department_name,
            s.year,
            s.section,
            DATE_FORMAT(a.attendance_date, '%Y-%m-%d') AS attendance_date,
            COALESCE(a.status, 'Present') AS status,
            TIME_FORMAT(a.check_in, '%H:%i') AS check_in,
            TIME_FORMAT(a.check_out, '%H:%i') AS check_out,
            COALESCE(a.remarks, '') AS remarks
        FROM students s
        LEFT JOIN departments d
            ON s.department_id = d.id
        LEFT JOIN attendance a
            ON s.id = a.student_id
            AND a.attendance_date = {date_clause}
        WHERE s.status = 'Active'
    """

    params = []
    if date:
        params.append(date)

    if dept_id and dept_id.isdigit():
        query += " AND s.department_id = %s"
        params.append(int(dept_id))

    query += " ORDER BY s.student_code ASC"

    cursor.execute(query, tuple(params))
    attendance = cursor.fetchall()

    # Safety serialization for any remaining date/time/timedelta objects
    for row in attendance:
        if row.get("attendance_date"):
            row["attendance_date"] = str(row["attendance_date"])
        if row.get("check_in") is not None:
            row["check_in"] = str(row["check_in"])[:5]
        if row.get("check_out") is not None:
            row["check_out"] = str(row["check_out"])[:5]

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "attendance": attendance
    })


# ==========================================
# MARK ATTENDANCE (SINGLE)
# ==========================================

@app.route("/api/attendance", methods=["POST"])
@login_required
def mark_attendance():
    data = request.get_json()

    student_id = data.get("student_id")
    attendance_date = data.get("attendance_date")
    status = data.get("status")
    check_in = data.get("check_in")
    remarks = data.get("remarks")

    if not student_id or not attendance_date or not status:
        return jsonify({
            "success": False,
            "message": "Required fields missing"
        }), 400

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("""
            INSERT INTO attendance
            (
                student_id,
                attendance_date,
                status,
                check_in,
                remarks,
                marked_by
            )
            VALUES (%s,%s,%s,%s,%s,%s)

            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                check_in = VALUES(check_in),
                remarks = VALUES(remarks),
                marked_by = VALUES(marked_by)
        """, (
            student_id,
            attendance_date,
            status,
            check_in if check_in else None,
            remarks if remarks else None,
            session["user_id"]
        ))

        db.commit()

        return jsonify({
            "success": True,
            "message": "Attendance saved"
        })

    except mysql.connector.Error as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        db.close()


# ==========================================
# MARK ATTENDANCE (BATCH / SAVE ALL)
# ==========================================

@app.route("/api/attendance/bulk", methods=["POST"])
@login_required
def mark_bulk_attendance():
    data = request.get_json()

    attendance_date = data.get("attendance_date")
    records = data.get("records", [])

    if not attendance_date or not records:
        return jsonify({
            "success": False,
            "message": "Attendance date and student records are required"
        }), 400

    db = get_db()
    cursor = db.cursor()

    try:
        saved_count = 0
        for item in records:
            student_id = item.get("student_id")
            status = item.get("status", "Present")
            check_in = item.get("check_in") or None
            remarks = item.get("remarks") or None

            if not student_id:
                continue

            cursor.execute("""
                INSERT INTO attendance
                (
                    student_id,
                    attendance_date,
                    status,
                    check_in,
                    remarks,
                    marked_by
                )
                VALUES (%s,%s,%s,%s,%s,%s)

                ON DUPLICATE KEY UPDATE
                    status = VALUES(status),
                    check_in = VALUES(check_in),
                    remarks = VALUES(remarks),
                    marked_by = VALUES(marked_by)
            """, (
                student_id,
                attendance_date,
                status,
                check_in,
                remarks,
                session["user_id"]
            ))
            saved_count += 1

        db.commit()

        return jsonify({
            "success": True,
            "message": f"Attendance saved for {saved_count} students!"
        })

    except mysql.connector.Error as e:
        db.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        db.close()


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )
