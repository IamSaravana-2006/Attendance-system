# AVCE Attendance Management System

Annai Vailankanni College of Engineering - Attendance Management System built with Flask + MySQL.

## Features
- Staff & Admin login
- 4 Departments (CSE, AIDS, BME, MECH)
- Student management (add single / bulk)
- Attendance marking (single / batch / CSV export)
- Live attendance stats
- Dashboard with metrics
- Dark/Light glass theme

## Local Development

### Prerequisites
- Python 3.8+
- MySQL Server (local)

### Setup

1. **Create the database:**
   ```bash
   mysql -u root -p < database.sql
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the app:**
   ```bash
   python app.py
   ```
   Visit http://localhost:5000

### Default Login
- **Admin:** `admin` / `admin123`
- **Staff:** `staff` / `staff123`

---

## Vercel Deployment

### Important Notes

Vercel is a **serverless** platform. Your local MySQL database (localhost:3306) **will NOT work** on Vercel. You must use a **cloud MySQL** database.

### 1. Set Up a Cloud MySQL Database

Choose one of these free/cheap MySQL providers:

| Provider | URL | Free Tier |
|----------|-----|-----------|
| **Railway** | https://railway.app | Yes (limited) |
| **PlanetScale** | https://planetscale.com | Yes |
| **Aiven** | https://aiven.io | Yes |
| **Clever Cloud** | https://clever-cloud.com | Yes |

After creating your cloud MySQL database, run the `database_cloud.sql` script to create the tables and seed data.

### 2. Configure Vercel Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `DB_HOST` | Your cloud MySQL host |
| `DB_USER` | Your cloud MySQL username |
| `DB_PASSWORD` | Your cloud MySQL password |
| `DB_NAME` | Your cloud MySQL database name |
| `DB_PORT` | `3306` (or your provider's port) |
| `SECRET_KEY` | A random secret string |

### 3. Deploy

**Option A - Vercel Dashboard (recommended):**
1. Go to https://vercel.com
2. Click **Add New → Project**
3. Import your GitHub repo (`IamSaravana-2006/Attendance-system`)
4. Framework preset: **Other**
5. Build Command: *(leave empty)*
6. Output Directory: *(leave empty)*
7. Add the environment variables above
8. Click **Deploy**

**Option B - Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel
```

### Files for Vercel
- `vercel.json` - Routes all requests to the Flask app
- `app.py` - Flask app (reads DB config from environment variables)
- `requirements.txt` - Pinned dependencies

---

## Troubleshooting Vercel 404

If you see a **404 NOT_FOUND** on Vercel:

1. **Missing `vercel.json`** - This file routes all requests to `app.py`. Without it, Vercel doesn't know how to serve your Flask app.

2. **Wrong project root** - Make sure Vercel is pointing to the root of the repo where `app.py` and `vercel.json` live.

3. **Missing environment variables** - The app will default to `localhost` which doesn't exist on Vercel.

4. **Check build logs** - In Vercel Dashboard → Deployments → your deployment → **Logs** tab.

5. **Confirm redeploy after changes** - Push new commits to `main` branch, Vercel auto-deploys.

## Project Structure
```
├── app.py                 # Flask application
├── vercel.json            # Vercel configuration
├── requirements.txt       # Python dependencies
├── database.sql           # Local MySQL setup script
├── database_cloud.sql     # Cloud MySQL setup script
├── static/
│   ├── style.css          # Styles
│   └── app.js             # Frontend logic
└── templates/
    ├── login.html         # Login page
    ├── dashboard.html     # Dashboard page
    ├── students.html      # Student management
    └── attendance.html    # Attendance page
```

## Developer
Developed by **Saravanan K** (Developer)