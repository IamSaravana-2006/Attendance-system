# AVCE Attendance Management System

Annai Vailankanni College of Engineering — Attendance Management System  
Built with **Flask + MySQL** · Developed by **Saravanan K**

---

## Features
- Staff & Admin login
- 4 Departments (CSE, AIDS, BME, MECH)
- Student management (add single / bulk list)
- Attendance marking (single / batch save / CSV export)
- Live attendance stats bar
- Dashboard with today's metrics
- Dark / Light glassmorphism theme

---

## Local Development

### Prerequisites
- Python 3.8+
- MySQL Server running locally

### Setup

```bash
# 1. Create local database
mysql -u root -p < database.sql

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py
```

Visit **http://localhost:5000**

### Default Login
| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | `admin`  | `admin123` |
| Staff | `staff`  | `staff123` |

---

## Deploy to Render (FREE — Recommended)

Render is the easiest platform for Flask + MySQL. Follow these steps exactly.

---

### Step 1 — Create a Free Cloud MySQL Database

Go to **https://railway.app** → Sign up (free)

1. Click **New Project → Deploy MySQL**
2. After it creates, click on the MySQL service
3. Go to **Connect** tab → copy these 5 values:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT` (usually `3306`)

4. Open **MySQL workbench** or any SQL client, connect using those details, and run the `database_cloud.sql` file to create all tables.

---

### Step 2 — Push Code to GitHub

```bash
# In your project folder
git init
git add .
git commit -m "Initial AVCE Attendance App"
git branch -M main
git remote add origin https://github.com/IamSaravana-2006/Attendance-system.git
git push -u origin main
```

---

### Step 3 — Deploy on Render

1. Go to **https://render.com** → Sign up / Login with GitHub
2. Click **New → Web Service**
3. Select your GitHub repo: `IamSaravana-2006/Attendance-system`
4. Render will auto-detect `render.yaml` — confirm settings:
   - **Name:** `avce-attendance`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Click **Advanced** → Add Environment Variables:

| Key | Value |
|-----|-------|
| `DB_HOST` | Your Railway MySQL host |
| `DB_USER` | Your Railway MySQL user |
| `DB_PASSWORD` | Your Railway MySQL password |
| `DB_NAME` | Your Railway MySQL database name |
| `DB_PORT` | `3306` |
| `SECRET_KEY` | Any random string (e.g. `avce2026secret`) |

6. Click **Create Web Service**
7. Wait ~2 minutes for build to complete
8. Your app will be live at: `https://avce-attendance.onrender.com`

---

### Step 4 — Test Your Live App

- Open the URL Render gives you
- Login with `admin` / `admin123`
- Add students and mark attendance — everything saves to Railway MySQL cloud

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **App crashes on Render** | Check Render Logs tab for error message |
| **Database connection failed** | Double-check all 5 DB environment variables |
| **500 error** | Run `database_cloud.sql` on Railway MySQL first |
| **Slow first load** | Free tier sleeps after 15 min inactivity — normal |

---

## Project Structure

```
├── app.py                 # Flask application
├── render.yaml            # Render deployment config
├── vercel.json            # Vercel deployment config (alternative)
├── requirements.txt       # Python dependencies (with gunicorn)
├── database.sql           # Local MySQL setup
├── database_cloud.sql     # Cloud MySQL setup (for Railway/Render)
├── .gitignore             # Git ignore rules
├── static/
│   ├── style.css          # Glassmorphism styles
│   └── app.js             # Frontend logic
└── templates/
    ├── login.html         # Login page
    ├── dashboard.html     # Dashboard
    ├── students.html      # Student management
    └── attendance.html    # Attendance management
```

---

## Developer

**Saravanan K** — Developer  
AVCE Attendance Management System © 2026