// =============================================================
// AVCE ATTENDANCE — Complete Mobile App JS Engine
// Fixes: all missing functions, routing bugs, missing handlers
// Developed by Saravanan K
// =============================================================

const AVCE = (() => {

// ── CONSTANTS ──────────────────────────────────────────────
const K = {
  session:    'avce_session',
  students:   'avce_students',
  attendance: 'avce_attendance',
  sid:        'avce_sid',
  aid:        'avce_aid',
  theme:      'avce_theme'
};

const USERS = [
  { id:1, username:'admin',  password:'admin123', full_name:'Administrator', role:'admin' },
  { id:2, username:'staff',  password:'staff123', full_name:'Staff User',    role:'staff' }
];

const DEPARTMENTS = [
  { id:1, name:'Computer Science & Engineering', code:'CSE',  short:'CSE'  },
  { id:2, name:'Artificial Intelligence & Data Science', code:'AIDS', short:'AIDS' },
  { id:3, name:'Biomedical Engineering',          code:'BME',  short:'BME'  },
  { id:4, name:'Mechanical Engineering',          code:'MECH', short:'MECH' }
];

// ── STORAGE ────────────────────────────────────────────────
function load(key, def) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def; }
  catch { return def; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function nextId(key) {
  const n = (load(key, 0)) + 1;
  save(key, n);
  return n;
}

// ── AUTH ───────────────────────────────────────────────────
function login(username, password) {
  const u = USERS.find(x => x.username === username && x.password === password);
  if (!u) return null;
  const sess = { user_id: u.id, username: u.username, full_name: u.full_name, role: u.role };
  save(K.session, sess);
  return sess;
}

function getSession() { return load(K.session, null); }

// requireLogin: check localStorage (set after successful Flask API login)
function requireLogin() {
  const s = getSession();
  if (!s) { window.location.href = '/login'; return null; }
  return s;
}

// logout: clear localStorage first, then try to clear server session (don't wait for it)
function logout() {
  localStorage.removeItem(K.session);
  // Fire-and-forget server session clear — don't block on 404/errors
  try { fetch('/api/logout').catch(() => {}); } catch(e) {}
  window.location.href = '/login';
}

// ── THEME ──────────────────────────────────────────────────
function initTheme() {
  const t = load(K.theme, 'light');
  document.documentElement.setAttribute('data-theme', t);
  updateThemeIcon(t);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  save(K.theme, next);
  updateThemeIcon(next);
  vibrate(30);
}

function updateThemeIcon(t) {
  const moon = `<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const sun  = `<svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  document.querySelectorAll('.theme-toggle-btn, #themeBtn').forEach(b => {
    b.innerHTML = t === 'dark' ? sun : moon;
    b.title = `Switch to ${t === 'dark' ? 'Light' : 'Dark'} Mode`;
  });
}

// ── HAPTIC FEEDBACK ────────────────────────────────────────
function vibrate(ms = 50) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch {}
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer';
    document.body.appendChild(c);
  }
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
  };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${msg}</span>`;
  c.appendChild(t);
  if (type === 'error') vibrate([50,30,50]);
  else if (type === 'success') vibrate(40);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(-16px) scale(0.95)';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

// ── HELPERS ────────────────────────────────────────────────
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return getToday();
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function esc(v) {
  if (!v && v !== 0) return '';
  return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function deptCode(id) { const d = DEPARTMENTS.find(x => x.id === parseInt(id)); return d ? d.code : '?'; }
function deptName(id) { const d = DEPARTMENTS.find(x => x.id === parseInt(id)); return d ? d.name : 'Unknown'; }
function deptClass(id) { return ({1:'cse',2:'aids',3:'bme',4:'mech'})[parseInt(id)] || 'default'; }
function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
}

// ── STUDENTS CRUD ──────────────────────────────────────────
function getStudents()     { return load(K.students, []); }
function saveStudents(arr) { save(K.students, arr); }

function addStudent(data) {
  const students = getStudents();
  const code = data.student_code || `${deptCode(data.department_id)}${String(nextId(K.sid)).padStart(3,'0')}`;
  if (students.find(s => s.student_code === code)) {
    return { success: false, message: 'Roll code already exists' };
  }
  const student = {
    id: Date.now(),
    student_code: code,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    gender: data.gender || '',
    department_id: parseInt(data.department_id),
    year: parseInt(data.year) || 1,
    section: (data.section || 'A').toUpperCase(),
    status: 'Active'
  };
  students.push(student);
  saveStudents(students);
  return { success: true, student };
}

function deleteStudent(id) {
  let students = getStudents();
  students = students.filter(s => s.id !== id);
  saveStudents(students);
  let att = getAttendance();
  att = att.filter(a => a.student_id !== id);
  saveAllAttendanceRaw(att);
  return { success: true };
}

function bulkAddStudents(names, deptId, year, section) {
  let count = 0;
  const added = [];
  names.forEach(name => {
    name = name.trim();
    if (!name) return;
    const r = addStudent({ name, department_id: deptId, year, section });
    if (r.success) { count++; added.push(r.student); }
  });
  return { success: true, count, students: added };
}

// BUG FIX: This function was called in students.html but never defined
function autoGenerateStudentCode() {
  const deptSelect = document.getElementById('departmentId');
  const codeInput  = document.getElementById('studentCode');
  if (!deptSelect || !codeInput) return;
  const deptId = parseInt(deptSelect.value);
  const prefix = deptCode(deptId);
  const count  = getStudents().filter(s => s.department_id === deptId).length;
  codeInput.value = `${prefix}${String(count + 1).padStart(3, '0')}`;
}

// ── ATTENDANCE CRUD ────────────────────────────────────────
function getAttendance()         { return load(K.attendance, []); }
function saveAllAttendanceRaw(a) { save(K.attendance, a); }

function getAttendanceForDate(date, deptId) {
  const students = getStudents().filter(s =>
    s.status === 'Active' && (!deptId || s.department_id === parseInt(deptId))
  );
  const att = getAttendance().filter(a => a.attendance_date === date);
  return students.map(s => {
    const a = att.find(x => x.student_id === s.id);
    return {
      id: s.id,
      student_id: s.id,
      student_code: s.student_code,
      name: s.name,
      department_id: s.department_id,
      year: s.year,
      section: s.section,
      status: a ? a.status : 'Present',
      check_in: a ? a.check_in : '',
      remarks: a ? a.remarks : ''
    };
  });
}

function saveAttendanceRecord(studentId, date, status, checkIn, remarks) {
  let att = getAttendance();
  const idx = att.findIndex(a => a.student_id === studentId && a.attendance_date === date);
  const record = { student_id: studentId, attendance_date: date, status, check_in: checkIn||'', remarks: remarks||'' };
  if (idx >= 0) att[idx] = record;
  else att.push(record);
  saveAllAttendanceRaw(att);
  return { success: true };
}

function bulkSaveAttendance(date, records) {
  let att = getAttendance();
  records.forEach(r => {
    const idx = att.findIndex(a => a.student_id === r.student_id && a.attendance_date === date);
    const rec = { student_id: r.student_id, attendance_date: date, status: r.status, check_in: r.check_in||'', remarks: r.remarks||'' };
    if (idx >= 0) att[idx] = rec;
    else att.push(rec);
  });
  saveAllAttendanceRaw(att);
  return { success: true, message: `Saved ${records.length} records` };
}

// ── DASHBOARD STATS ────────────────────────────────────────
function getDashboardStats() {
  const students = getStudents();
  const today    = getToday();
  const att      = getAttendance().filter(a => a.attendance_date === today);
  const present  = att.filter(a => a.status === 'Present').length;
  const absent   = att.filter(a => a.status === 'Absent').length;
  const late     = att.filter(a => a.status === 'Late').length;
  const deptCounts = {};
  DEPARTMENTS.forEach(d => {
    deptCounts[d.code] = students.filter(s => s.department_id === d.id).length;
  });
  return { total: students.length, present, absent, late, deptCounts };
}

// ── COUNT-UP ANIMATION ─────────────────────────────────────
function countUp(el, target, duration = 700) {
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const range = target - start;
  if (range === 0) { el.textContent = target; return; }
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.round(start + range * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── EXPORT ─────────────────────────────────────────────────
function exportJSON() {
  const data = { students: getStudents(), attendance: getAttendance(), exported: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `AVCE_Data_${getToday()}.json`;
  a.click();
  showToast('Data exported as JSON!', 'success');
}

function exportCSV(rows, filename, headers) {
  let csv = headers.join(',') + '\n';
  rows.forEach(r => { csv += r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',') + '\n'; });
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  a.download = filename;
  a.click();
}

// ── PUBLIC API ─────────────────────────────────────────────
return {
  _K: K,  // expose storage keys so external code can clear session
  login, getSession, requireLogin, logout,
  initTheme, toggleTheme, updateThemeIcon,
  showToast, getToday, formatDate, getGreeting, esc,
  deptCode, deptName, deptClass, getInitials, vibrate, countUp,
  DEPARTMENTS,
  getStudents, addStudent, deleteStudent, bulkAddStudents, autoGenerateStudentCode,
  getAttendance, getAttendanceForDate, saveAttendanceRecord, bulkSaveAttendance,
  getDashboardStats,
  exportJSON, exportCSV
};

})();

// ── GLOBAL SHORTCUTS ───────────────────────────────────────
const showToast   = AVCE.showToast.bind(AVCE);
const toggleTheme = AVCE.toggleTheme.bind(AVCE);
const logout      = AVCE.logout.bind(AVCE);
const getToday    = AVCE.getToday.bind(AVCE);


// ══════════════════════════════════════════════════════════
// PAGE: LOGIN
// ══════════════════════════════════════════════════════════
function initLoginPage() {
  // If already logged in locally, verify Flask session still valid
  if (AVCE.getSession()) {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data.logged_in) {
          window.location.href = '/dashboard';
        } else {
          // Flask session expired — clear localStorage and stay on login
          localStorage.removeItem(AVCE._K ? AVCE._K.session : 'avce_session');
        }
      })
      .catch(() => {
        // Offline or server error — stay on login page
      });
  }
  AVCE.initTheme();

  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const msg = document.getElementById('loginMessage');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      if (msg) { msg.textContent = 'Please enter username and password.'; }
      AVCE.vibrate([50,30,50]);
      return;
    }

    // Loading state
    if (btn) { btn.textContent = 'Signing in…'; btn.disabled = true; }

    try {
      // Step 1: Call Flask API to set the server-side session
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();

      if (data.success) {
        // Step 2: Also save to localStorage so JS pages can access user info
        const sess = AVCE.login(username, password);
        if (msg) { msg.style.color = 'var(--success)'; msg.textContent = '✓ Welcome back!'; }
        AVCE.vibrate(60);
        // Short delay for the success animation, then redirect
        setTimeout(() => { window.location.href = '/dashboard'; }, 550);
      } else {
        if (msg) { msg.style.color = 'var(--danger)'; msg.textContent = data.message || 'Invalid username or password.'; }
        if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
        AVCE.vibrate([50,30,50]);
      }
    } catch (err) {
      // Network error fallback: try localStorage-only login
      const sess = AVCE.login(username, password);
      if (sess) {
        if (msg) { msg.style.color = 'var(--success)'; msg.textContent = '✓ Welcome back!'; }
        AVCE.vibrate(60);
        setTimeout(() => { window.location.href = '/dashboard'; }, 550);
      } else {
        if (msg) { msg.style.color = 'var(--danger)'; msg.textContent = 'Invalid username or password.'; }
        if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
        AVCE.vibrate([50,30,50]);
      }
    }
  });
}


// ══════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════
let _dashLoaded = false;

function initDashboardPage() {
  const sess = AVCE.requireLogin();
  if (!sess) return;
  AVCE.initTheme();
  setBottomNavActive('dashboard');
  renderGreeting(sess);
  loadDashboard();
  setCurrentDate();
}

function renderGreeting(sess) {
  const el = document.getElementById('greetingName');
  const gt = document.getElementById('greetingTime');
  const gd = document.getElementById('greetingDate');
  if (el) el.textContent = `${AVCE.getGreeting()}, ${sess.full_name}! 👋`;
  if (gt) gt.textContent = AVCE.getGreeting().toUpperCase();
  if (gd) {
    const now = new Date();
    gd.textContent = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }
}

function setCurrentDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
}

// FIXED: Dashboard now fetches from Flask API (MySQL) instead of localStorage only
function loadDashboard() {
  fetch('/api/dashboard')
    .then(r => r.json())
    .then(data => {
      if (!data.success) return;

      countUp(document.getElementById('totalStudents'),   data.total_students || 0);
      countUp(document.getElementById('presentStudents'), data.present || 0);
      countUp(document.getElementById('absentStudents'),  data.absent || 0);
      countUp(document.getElementById('lateStudents'),    data.late || 0);

      // Department counts from API
      const deptCodeMap = { 1: 'cse', 2: 'aids', 3: 'bme', 4: 'mech' };
      if (data.department_stats) {
        data.department_stats.forEach(d => {
          const code = deptCodeMap[d.id];
          if (code) {
            const el = document.getElementById(`count-${code}`);
            if (el) countUp(el, d.student_count || 0);
          }
        });
      }

      _dashLoaded = true;
    })
    .catch(() => {
      // Fallback to localStorage if API fails (offline)
      const stats = AVCE.getDashboardStats();
      countUp(document.getElementById('totalStudents'),   stats.total);
      countUp(document.getElementById('presentStudents'), stats.present);
      countUp(document.getElementById('absentStudents'),  stats.absent);
      countUp(document.getElementById('lateStudents'),    stats.late);
      const depts = ['CSE','AIDS','BME','MECH'];
      depts.forEach(code => {
        const el = document.getElementById(`count-${code.toLowerCase()}`);
        if (el) countUp(el, stats.deptCounts[code] || 0);
      });
      _dashLoaded = true;
    });
}

const countUp = AVCE.countUp;


// ══════════════════════════════════════════════════════════
// PAGE: STUDENTS
// ══════════════════════════════════════════════════════════
let _currentDeptFilter = '';
let _allStudents = [];

function initStudentsPage() {
  const sess = AVCE.requireLogin();
  if (!sess) return;
  AVCE.initTheme();
  setBottomNavActive('students');

  // BUG FIX: Setup form submit on modal form (was never hooked up)
  const sf = document.getElementById('studentForm');
  if (sf) sf.addEventListener('submit', handleAddStudent);

  // BUG FIX: Setup bulk form submit
  const bf = document.getElementById('bulkStudentForm');
  if (bf) bf.addEventListener('submit', handleBulkAddStudents);

  loadStudents();
}

// BUG FIX: filterByDepartment was called in HTML but never defined
function filterByDepartment(deptId, btn) {
  _currentDeptFilter = deptId;
  // Update chip UI
  document.querySelectorAll('.chip[data-dept]').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderStudentList();
}

// BUG FIX: searchStudents was called in HTML but never defined
function searchStudents() {
  renderStudentList();
}

// FIXED: loadStudents now fetches all students from Flask API (MySQL)
// Department filtering is handled by renderStudentList() in the UI
function loadStudents(deptId) {
  if (deptId !== undefined) _currentDeptFilter = deptId;

  fetch('/api/students')
    .then(r => r.json())
    .then(data => {
      _allStudents = data.success ? (data.students || []) : [];
      renderStudentList();
    })
    .catch(() => {
      // Fallback to localStorage if API fails
      _allStudents = AVCE.getStudents();
      renderStudentList();
    });
}

function renderStudentList() {
  const list = document.getElementById('studentList');
  if (!list) return;

  const query = (document.getElementById('studentSearch')?.value || '').toLowerCase().trim();
  let students = _allStudents;

  if (_currentDeptFilter) {
    students = students.filter(s => s.department_id === parseInt(_currentDeptFilter));
  }
  if (query) {
    students = students.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.student_code.toLowerCase().includes(query) ||
      AVCE.deptCode(s.department_id).toLowerCase().includes(query)
    );
  }

  // Update total count
  const countEl = document.getElementById('studentCount');
  if (countEl) countEl.textContent = students.length;

  if (!students.length) {
    list.innerHTML = `
      <div class="empty-illustrator">
        <svg viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="50" fill="var(--primary-light)" class="empty-float"/>
          <path d="M60 35 C60 35 45 45 45 60 C45 75 52 82 60 85 C68 82 75 75 75 60 C75 45 60 35 60 35Z" fill="var(--primary)" opacity="0.3"/>
          <circle cx="60" cy="55" r="14" fill="var(--primary)" opacity="0.6"/>
          <path d="M35 90 Q60 80 85 90" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.5"/>
          <line x1="80" y1="30" x2="90" y2="20" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="30" y1="30" x2="20" y2="20" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <h3>No students found</h3>
        <p>${query ? 'Try a different search term.' : 'Add students using the + button below.'}</p>
      </div>`;
    return;
  }

  list.innerHTML = students.map((s, idx) => {
    const cls   = AVCE.deptClass(s.department_id);
    const init  = AVCE.getInitials(s.name);
    const delay = Math.min(idx * 40, 400);
    return `
      <div class="student-card" style="animation-delay:${delay}ms">
        <div class="student-avatar ${cls}">${AVCE.esc(init)}</div>
        <div class="student-info">
          <div class="student-name">${AVCE.esc(s.name)}</div>
          <div class="student-meta">
            <span class="student-code">${AVCE.esc(s.student_code)}</span>
            <span class="student-dept ${cls}">${AVCE.deptCode(s.department_id)}</span>
            <span class="student-section-tag">Yr ${s.year} · Sec ${AVCE.esc(s.section)}</span>
          </div>
        </div>
        <div class="student-actions">
          <button class="btn-delete" onclick="confirmDeleteStudent(${s.id},'${AVCE.esc(s.name)}')" title="Delete ${AVCE.esc(s.name)}">
            <svg width="15" height="15" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');
}

// FIXED: confirmDeleteStudent now calls Flask DELETE API
function confirmDeleteStudent(id, name) {
  AVCE.vibrate([30, 20, 30]);
  if (!confirm(`Delete student "${name}"? This will also remove their attendance records.`)) return;

  fetch(`/api/students/${id}`, { method: 'DELETE' })
    .then(r => r.json())
    .then(result => {
      if (result.success) {
        showToast(`${name} removed.`, 'success');
        loadStudents();
      } else {
        showToast(result.message || 'Failed to delete student.', 'error');
      }
    })
    .catch(() => {
      // Fallback: delete from localStorage
      AVCE.deleteStudent(id);
      loadStudents();
      showToast(`${name} removed.`, 'success');
    });
}

// BUG FIX: openStudentModal was called in HTML but never defined
function openStudentModal() {
  const overlay = document.getElementById('studentModal');
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.style.display = 'flex';
  AVCE.autoGenerateStudentCode();
  AVCE.vibrate(30);
  document.body.style.overflow = 'hidden';
}

// BUG FIX: closeStudentModal was called in HTML but never defined
function closeStudentModal() {
  const overlay = document.getElementById('studentModal');
  if (!overlay) return;
  overlay.style.display = 'none';
  overlay.classList.remove('open');
  document.getElementById('studentForm')?.reset();
  document.body.style.overflow = '';
}

// BUG FIX: openBulkStudentModal was called in HTML but never defined
function openBulkStudentModal() {
  const overlay = document.getElementById('bulkStudentModal');
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.style.display = 'flex';
  AVCE.vibrate(30);
  document.body.style.overflow = 'hidden';
}

// BUG FIX: closeBulkStudentModal was called in HTML but never defined
function closeBulkStudentModal() {
  const overlay = document.getElementById('bulkStudentModal');
  if (!overlay) return;
  overlay.style.display = 'none';
  overlay.classList.remove('open');
  // Clear the dynamic names list so it starts fresh next time
  const namesList = document.getElementById('bulkNamesList');
  if (namesList) namesList.innerHTML = '';
  document.getElementById('bulkStudentForm')?.reset();
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeStudentModal();
    closeBulkStudentModal();
  }
});

// FIXED: handleAddStudent now calls Flask API (MySQL) instead of localStorage only
function handleAddStudent(e) {
  e.preventDefault();
  const data = {
    student_code:  document.getElementById('studentCode')?.value.trim(),
    name:          document.getElementById('studentName')?.value.trim(),
    phone:         document.getElementById('studentPhone')?.value.trim(),
    gender:        document.getElementById('studentGender')?.value,
    department_id: document.getElementById('departmentId')?.value,
    year:          document.getElementById('studentYear')?.value,
    section:       document.getElementById('studentSection')?.value.trim()
  };
  if (!data.name || !data.student_code || !data.department_id) {
    showToast('Name, roll code and department are required.', 'error');
    return;
  }
  const submitBtn = document.querySelector('#studentForm [type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving…'; }

  fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(r => r.json())
    .then(result => {
      if (result.success) {
        showToast(`${data.name} added successfully!`, 'success');
        AVCE.vibrate(60);
        closeStudentModal();
        loadStudents();
      } else {
        showToast(result.message || 'Failed to add student.', 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Student'; }
      }
    })
    .catch(() => {
      showToast('Network error. Please try again.', 'error');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Student'; }
    });
}

// handleBulkAddStudents: logic now handled inline in students.html
// (supports row-based entry, clipboard paste, animated progress bar)
function handleBulkAddStudents(e) {
  if (e) e.preventDefault();
  // No-op stub — real implementation is in students.html inline script
}

// BUG FIX: exportStudentsCSV was called in HTML but never defined
function exportStudentsCSV() {
  const students = _allStudents.length ? _allStudents : AVCE.getStudents();
  if (!students.length) { showToast('No students to export.', 'warning'); return; }
  AVCE.exportCSV(
    students.map(s => [s.student_code, s.name, AVCE.deptName(s.department_id), s.year, s.section, s.gender||'', s.email||'', s.phone||'']),
    `AVCE_Students_${getToday()}.csv`,
    ['Roll Code','Name','Department','Year','Section','Gender','Email','Phone']
  );
  showToast('Students exported!', 'success');
}


// ══════════════════════════════════════════════════════════
// PAGE: ATTENDANCE
// ══════════════════════════════════════════════════════════
let _attData    = [];
let _attDate    = '';
let _attDept    = '';
let _showAbsentOnly = false;

function initAttendancePage() {
  const sess = AVCE.requireLogin();
  if (!sess) return;
  AVCE.initTheme();
  setBottomNavActive('attendance');

  // Set today's date as default
  const dateInput = document.getElementById('attendanceDate');
  if (dateInput) { dateInput.value = getToday(); }

  loadAttendance();
}

// FIXED: loadAttendance now fetches from Flask API (MySQL) instead of localStorage only
function loadAttendance() {
  const dateInput = document.getElementById('attendanceDate');
  const deptSel   = document.getElementById('attendanceDepartment');
  _attDate = dateInput ? dateInput.value || getToday() : getToday();
  _attDept = deptSel ? deptSel.value : '';
  _showAbsentOnly = false;

  // Reset toggle button
  const toggleBtn = document.getElementById('toggleAbsenteesBtn');
  if (toggleBtn) toggleBtn.classList.remove('active');

  // Build API URL
  let url = `/api/attendance?date=${_attDate}`;
  if (_attDept) url += `&department_id=${_attDept}`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        // Map API response to the format _attData expects
        _attData = (data.attendance || []).map(r => ({
          id:            r.id,
          student_id:    r.id,
          student_code:  r.student_code,
          name:          r.name,
          department_id: r.department_id,
          year:          r.year,
          section:       r.section,
          status:        r.status || 'Present',
          marked:        r.marked === 1 || r.marked === true,
          check_in:      r.check_in || '',
          remarks:       r.remarks || ''
        }));
      } else {
        _attData = [];
      }
      updateLiveStats();
      renderAttendanceList();
    })
    .catch(() => {
      // Fallback to localStorage if API fails
      _attData = AVCE.getAttendanceForDate(_attDate, _attDept);
      updateLiveStats();
      renderAttendanceList();
    });
}

function updateLiveStats() {
  const total    = _attData.length;
  const marked   = _attData.filter(r => r.marked).length;
  // Count ALL students by status (including unmarked defaults = Present)
  const present  = _attData.filter(r => r.status === 'Present').length;
  const absent   = _attData.filter(r => r.status === 'Absent').length;
  const late     = _attData.filter(r => r.status === 'Late').length;
  const unmarked = total - marked;
  const rate     = total ? Math.round((present / total) * 100) : 0;

  AVCE.countUp(document.getElementById('liveStatTotal'),    total);
  AVCE.countUp(document.getElementById('liveStatPresent'),  present);
  AVCE.countUp(document.getElementById('liveStatAbsent'),   absent);
  AVCE.countUp(document.getElementById('liveStatLate'),     late);
  AVCE.countUp(document.getElementById('liveStatUnmarked'), unmarked);
  const rateEl = document.getElementById('liveStatRate');
  if (rateEl) rateEl.textContent = rate + '%';
}

function renderAttendanceList() {
  const list = document.getElementById('attendanceList');
  if (!list) return;

  let data = _attData;
  if (_showAbsentOnly) {
    data = data.filter(r => r.status === 'Absent' || r.status === 'Late');
  }

  if (!data.length) {
    list.innerHTML = `
      <div class="empty-illustrator">
        <svg viewBox="0 0 120 120" fill="none">
          <rect x="25" y="20" width="70" height="85" rx="8" fill="var(--primary-light)" class="empty-float"/>
          <rect x="35" y="35" width="50" height="6" rx="3" fill="var(--primary)" opacity="0.4"/>
          <rect x="35" y="48" width="38" height="6" rx="3" fill="var(--primary)" opacity="0.3"/>
          <circle cx="40" cy="72" r="10" fill="var(--success)" opacity="0.5"/>
          <polyline points="35,72 39,76 46,68" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
        <h3>${_showAbsentOnly ? 'No absentees!' : 'No students found'}</h3>
        <p>${_showAbsentOnly ? 'All students are present today. 🎉' : 'Add students first, then mark attendance.'}</p>
      </div>`;
    return;
  }

  list.innerHTML = data.map((r, idx) => {
    const cls   = AVCE.deptClass(r.department_id);
    const delay = Math.min(idx * 30, 400);
    const sts   = r.status || 'Present';
    return `
      <div class="attendance-card status-${sts.toLowerCase()}" id="att-card-${r.student_id}" style="animation-delay:${delay}ms">
        <div class="att-card-top">
          <div class="student-avatar ${cls}" style="width:40px;height:40px;border-radius:12px;font-size:13px;flex-shrink:0;">
            ${AVCE.esc(AVCE.getInitials(r.name))}
          </div>
          <div style="flex:1;min-width:0;">
            <div class="att-student-name">${AVCE.esc(r.name)}</div>
            <div style="font-size:11px;color:var(--text-3);">${AVCE.deptCode(r.department_id)} · Yr ${r.year} · Sec ${AVCE.esc(r.section)}</div>
          </div>
          <span class="att-student-code">${AVCE.esc(r.student_code)}</span>
        </div>

        <div class="att-status-row">
          <button class="status-btn present-btn ${sts==='Present'?'active':''}"
            onclick="setStatus(${r.student_id},'Present',this)"
            title="Mark Present">
            <svg width="13" height="13" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Present
          </button>
          <button class="status-btn absent-btn ${sts==='Absent'?'active':''}"
            onclick="setStatus(${r.student_id},'Absent',this)"
            title="Mark Absent">
            <svg width="13" height="13" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Absent
          </button>
          <button class="status-btn late-btn ${sts==='Late'?'active':''}"
            onclick="setStatus(${r.student_id},'Late',this)"
            title="Mark Late">
            <svg width="13" height="13" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Late
          </button>
          <button class="status-btn leave-btn ${sts==='Leave'?'active':''}"
            onclick="setStatus(${r.student_id},'Leave',this)"
            title="Mark Leave">
            <svg width="13" height="13" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Leave
          </button>
        </div>

        <div class="att-remarks">
          <input type="text" class="remarks-input" id="remarks-${r.student_id}"
            placeholder="Remarks (optional)" value="${AVCE.esc(r.remarks)}">
        </div>
      </div>`;
  }).join('');
}

// setStatus: update in-memory status + card UI + live stats strip
function setStatus(studentId, status, btn) {
  // Update in-memory data
  const rec = _attData.find(r => r.student_id === studentId);
  if (rec) {
    rec.status = status;
    rec.marked = true;  // Mark as explicitly set by user
  }

  // Update card left-border color
  const card = document.getElementById(`att-card-${studentId}`);
  if (card) {
    card.classList.remove('status-present','status-absent','status-late','status-leave');
    card.classList.add(`status-${status.toLowerCase()}`);
  }

  // Update buttons in this card row
  if (btn) {
    const row = btn.closest('.att-status-row');
    if (row) row.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // BUG FIX: Update the live stats strip immediately on every tap
  updateLiveStats();
  AVCE.vibrate(30);
}

// BUG FIX: markAllPresent was called in HTML but never defined
function markAllPresent() {
  _attData.forEach(r => { r.status = 'Present'; r.marked = true; });
  renderAttendanceList();
  updateLiveStats();
  showToast('All students marked Present!', 'success');
  AVCE.vibrate(60);
}

// BUG FIX: toggleAbsenteesOnly was called in HTML but never defined
function toggleAbsenteesOnly() {
  _showAbsentOnly = !_showAbsentOnly;
  const btn = document.getElementById('toggleAbsenteesBtn');
  if (btn) {
    btn.classList.toggle('active', _showAbsentOnly);
    btn.innerHTML = _showAbsentOnly
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Show All`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Absentees Only`;
  }
  renderAttendanceList();
}

// FIXED: saveAllAttendance now calls Flask API (MySQL) instead of localStorage only
function saveAllAttendance() {
  if (!_attData.length) { showToast('No attendance records to save.', 'warning'); return; }

  // Collect current remarks from DOM
  _attData.forEach(r => {
    const remEl = document.getElementById(`remarks-${r.student_id}`);
    if (remEl) r.remarks = remEl.value.trim();
  });

  const records = _attData.map(r => ({
    student_id: r.student_id,
    status: r.status,
    check_in: r.check_in || '',
    remarks: r.remarks || ''
  }));

  const saveBtn = document.getElementById('saveAllBtn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.classList.add('saving'); }

  fetch('/api/attendance/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attendance_date: _attDate, records })
  })
    .then(r => r.json())
    .then(result => {
      if (result.success) {
        updateLiveStats();
        showToast(`✓ Attendance saved for ${records.length} students!`, 'success');
        AVCE.vibrate(80);
      } else {
        showToast(result.message || 'Failed to save attendance.', 'error');
      }
    })
    .catch(() => {
      // Fallback to localStorage
      AVCE.bulkSaveAttendance(_attDate, records);
      updateLiveStats();
      showToast(`✓ Attendance saved (offline mode)!`, 'success');
      AVCE.vibrate(80);
    })
    .finally(() => {
      if (saveBtn) {
        saveBtn.disabled = false;
        setTimeout(() => saveBtn.classList.remove('saving'), 400);
      }
    });
}

// BUG FIX: exportAttendanceCSV was called in HTML but never defined
function exportAttendanceCSV() {
  const data = _attData.length ? _attData : AVCE.getAttendanceForDate(getToday(), '');
  if (!data.length) { showToast('No attendance data to export.', 'warning'); return; }
  AVCE.exportCSV(
    data.map(r => [r.student_code, r.name, AVCE.deptName(r.department_id), r.year, r.section, r.status, r.check_in||'', r.remarks||'']),
    `AVCE_Attendance_${_attDate || getToday()}.csv`,
    ['Roll Code','Name','Department','Year','Section','Status','Check In','Remarks']
  );
  showToast('Attendance exported!', 'success');
}


// ══════════════════════════════════════════════════════════
// BOTTOM NAV ACTIVE STATE
// ══════════════════════════════════════════════════════════
function setBottomNavActive(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}


// ══════════════════════════════════════════════════════════
// AUTO-INIT BASED ON PAGE
// Works for: Flask (/students), GitHub Pages (/Attendance-system/students.html)
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname.toLowerCase();

  // Flexible page matcher: works for Flask routes AND GitHub Pages .html paths
  const isPage = (name) =>
    path === '/' + name ||
    path.endsWith('/' + name) ||
    path.endsWith('/' + name + '.html') ||
    path === name + '.html' ||
    path === '/' + name + '.html';

  if (isPage('login') || path === '/' || path.endsWith('index.html') || path.endsWith('index')) {
    if (document.getElementById('loginForm')) initLoginPage();
  } else if (isPage('dashboard')) {
    if (document.getElementById('totalStudents')) initDashboardPage();
  } else if (isPage('students')) {
    if (document.getElementById('studentList')) initStudentsPage();
  } else if (isPage('attendance')) {
    if (document.getElementById('attendanceList')) initAttendancePage();
  } else {
    // Fallback: detect page by DOM elements (handles any unknown URL patterns)
    if      (document.getElementById('loginForm'))      initLoginPage();
    else if (document.getElementById('totalStudents'))  initDashboardPage();
    else if (document.getElementById('studentList'))    initStudentsPage();
    else if (document.getElementById('attendanceList')) initAttendancePage();
  }
});
