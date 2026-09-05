// =============================================================
// AVCE ATTENDANCE - localStorage JSON Engine
// No database, no server. Works on GitHub Pages!
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
    { id:1, username:'admin', password:'admin123', full_name:'Administrator', role:'admin' },
    { id:2, username:'staff', password:'staff123', full_name:'Staff User',    role:'staff' }
];

const DEPARTMENTS = [
    { id:1, name:'Computer Science & Engineering', code:'CSE'  },
    { id:2, name:'Artificial Intelligence & Data Science', code:'AIDS' },
    { id:3, name:'Biomedical Engineering',          code:'BME'  },
    { id:4, name:'Mechanical Engineering',          code:'MECH' }
];

// ── STORAGE HELPERS ────────────────────────────────────────
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

function requireLogin() {
    const s = getSession();
    if (!s) { window.location.href = 'index.html'; return null; }
    return s;
}

function logout() {
    localStorage.removeItem(K.session);
    window.location.href = 'index.html';
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
}

function updateThemeIcon(t) {
    const moon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    const sun  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    document.querySelectorAll('.theme-toggle-btn').forEach(b => {
        b.innerHTML = t === 'dark' ? sun : moon;
        b.title = `Switch to ${t === 'dark' ? 'Light' : 'Dark'} Mode`;
    });
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type = 'info') {
    let c = document.getElementById('toastContainer');
    if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; document.body.appendChild(c); }
    const icons = {
        success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--danger)"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--warning)"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
    };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type]||icons.info}</span><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(80px)'; setTimeout(()=>t.remove(),300); }, 3000);
}

// ── HELPERS ────────────────────────────────────────────────
function getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function esc(v) {
    if (!v && v !== 0) return '';
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function deptCode(id) { const d = DEPARTMENTS.find(x=>x.id===parseInt(id)); return d?d.code:'?'; }
function deptName(id) { const d = DEPARTMENTS.find(x=>x.id===parseInt(id)); return d?d.name:'Unknown'; }
function deptClass(id) { return ({1:'cse',2:'aids',3:'bme',4:'mech'})[parseInt(id)]||'default'; }

// ── STUDENTS CRUD ──────────────────────────────────────────
function getStudents()          { return load(K.students, []); }
function saveStudents(arr)      { save(K.students, arr); }

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
        section: data.section || 'A',
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
    // also remove attendance for this student
    let att = getAttendance();
    att = att.filter(a => a.student_id !== id);
    saveAllAttendanceRaw(att);
    return { success: true };
}

function bulkAddStudents(names, deptId, year, section) {
    let count = 0;
    names.forEach(name => {
        name = name.trim();
        if (!name) return;
        addStudent({ name, department_id: deptId, year, section });
        count++;
    });
    return { success: true, count };
}

// ── ATTENDANCE CRUD ────────────────────────────────────────
function getAttendance()         { return load(K.attendance, []); }
function saveAllAttendanceRaw(a) { save(K.attendance, a); }

function getAttendanceForDate(date, deptId) {
    const students = getStudents().filter(s => !deptId || s.department_id === parseInt(deptId));
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
            status: a ? a.status : 'Absent',
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
    const today = getToday();
    const att = getAttendance().filter(a => a.attendance_date === today);
    const present = att.filter(a => a.status === 'Present').length;
    const absent  = att.filter(a => a.status === 'Absent').length;
    const late    = att.filter(a => a.status === 'Late').length;
    const deptCounts = {};
    DEPARTMENTS.forEach(d => {
        deptCounts[d.code] = students.filter(s => s.department_id === d.id).length;
    });
    return { total: students.length, present, absent, late, deptCounts };
}

// ── JSON EXPORT / IMPORT ───────────────────────────────────
function exportJSON() {
    const data = { students: getStudents(), attendance: getAttendance(), exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `AVCE_Data_${getToday()}.json`;
    a.click();
    showToast('Data exported as JSON!', 'success');
}

function importJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.students) saveStudents(data.students);
            if (data.attendance) saveAllAttendanceRaw(data.attendance);
            showToast(`Imported ${(data.students||[]).length} students successfully!`, 'success');
            if (callback) callback();
        } catch {
            showToast('Invalid JSON file!', 'error');
        }
    };
    reader.readAsText(file);
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
    login, getSession, requireLogin, logout,
    initTheme, toggleTheme, updateThemeIcon,
    showToast, getToday, esc, deptCode, deptName, deptClass,
    DEPARTMENTS,
    getStudents, addStudent, deleteStudent, bulkAddStudents,
    getAttendance, getAttendanceForDate, saveAttendanceRecord, bulkSaveAttendance,
    getDashboardStats,
    exportJSON, importJSON, exportCSV
};

})();

// Global shortcuts (backward compat)
const showToast    = AVCE.showToast.bind(AVCE);
const toggleTheme  = AVCE.toggleTheme.bind(AVCE);
const logout       = AVCE.logout.bind(AVCE);
const getToday     = AVCE.getToday.bind(AVCE);
