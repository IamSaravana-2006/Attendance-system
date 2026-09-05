// ==========================================================================
// AVCE ATTENDANCE MANAGEMENT SYSTEM - CLIENT SCRIPT & ADVANCED CAPABILITIES
// Developed by Saravanan K (Developer)
// ==========================================================================

let allStudents = [];
let activeDeptFilter = "";
let departmentsList = [];
let showingAbsenteesOnly = false;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    // Initialize Theme (Dark/Light)
    initTheme();

    // Login page initialization
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }

    // Load 4 Departments dynamically
    loadDepartments();

    // Dashboard page initialization
    if (document.getElementById("totalStudents")) {
        loadDashboard();
        showCurrentDate();
    }

    // Students page initialization
    if (document.getElementById("studentTableBody")) {
        loadStudents();
        const studentForm = document.getElementById("studentForm");
        if (studentForm) {
            studentForm.addEventListener("submit", addStudent);
        }
    }

    // Attendance page initialization
    if (document.getElementById("attendanceTableBody")) {
        const dateInput = document.getElementById("attendanceDate");
        if (dateInput && !dateInput.value) {
            dateInput.value = getToday();
        }
        loadAttendance();
    }
});


// ==========================================
// MODERN TOAST NOTIFICATIONS (Replaces alert)
// ==========================================

function showToast(message, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--danger)"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--warning)"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    const icon = icons[type] || icons.info;

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 3.2 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}


// ==========================================
// THEME SWITCHER (Dark/Light Glass)
// ==========================================

function initTheme() {
    const savedTheme = localStorage.getItem("avce_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeToggleIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("avce_theme", newTheme);
    updateThemeToggleIcon(newTheme);
    showToast(`Switched to ${newTheme === "dark" ? "Dark Glass" : "Light Glass"} Mode`, "info");
}

function updateThemeToggleIcon(theme) {
    const moonSVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const sunSVG  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    const btns = document.querySelectorAll(".theme-toggle-btn");
    btns.forEach(btn => {
        btn.innerHTML = theme === "dark" ? sunSVG : moonSVG;
        btn.setAttribute("title", `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`);
    });
}


// ==========================================
// LOGIN & LOGOUT
// ==========================================

async function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    message.textContent = "Verifying credentials...";
    message.style.color = "#60a5fa";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            message.textContent = "Login successful! Entering system...";
            message.style.color = "#4ade80";
            showToast("Welcome back! Loading dashboard...", "success");
            setTimeout(function () {
                window.location.href = "/dashboard";
            }, 500);
        } else {
            message.textContent = data.message || "Invalid username or password";
            message.style.color = "#f87171";
            showToast(data.message || "Invalid login credentials", "error");
        }
    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Unable to connect to the server.";
        message.style.color = "#f87171";
        showToast("Server connection failed", "error");
    }
}

async function logout() {
    try {
        await fetch("/api/logout");
        showToast("Logged out successfully", "info");
        setTimeout(() => {
            window.location.href = "/login";
        }, 400);
    } catch (error) {
        console.error("Logout error:", error);
        window.location.href = "/login";
    }
}


// ==========================================
// 4 DEPARTMENTS LOADER
// ==========================================

async function loadDepartments() {
    try {
        const response = await fetch("/api/departments");
        if (response.status === 401) return;

        const data = await response.json();
        if (data.success && data.departments) {
            departmentsList = data.departments;
            populateDepartmentSelects(departmentsList);
        }
    } catch (error) {
        console.error("Error loading departments:", error);
    }
}

function populateDepartmentSelects(depts) {
    const selects = ["departmentId", "bulkDepartmentId"];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = "";
            depts.forEach(d => {
                const opt = document.createElement("option");
                opt.value = d.id;
                opt.textContent = d.department_name;
                el.appendChild(opt);
            });
        }
    });

    // Also populate attendanceDepartment if needed
    const attDept = document.getElementById("attendanceDepartment");
    if (attDept && attDept.options.length <= 1) {
        depts.forEach(d => {
            const opt = document.createElement("option");
            opt.value = d.id;
            opt.textContent = d.department_name;
            attDept.appendChild(opt);
        });
    }
}


// ==========================================
// DASHBOARD LOGIC
// ==========================================

async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");
        if (response.status === 401) {
            window.location.href = "/login";
            return;
        }

        const data = await response.json();
        if (!data.success) return;

        // User info display
        if (data.user) {
            const nameEl = document.getElementById("userNameDisplay");
            const roleEl = document.getElementById("userRoleDisplay");
            if (nameEl) nameEl.textContent = (data.user.username || "Staff").toUpperCase();
            if (roleEl) roleEl.textContent = (data.user.role || "Staff").toUpperCase();
        }

        // Animated metric counters
        animateNumber("totalStudents", data.total_students);
        animateNumber("presentStudents", data.present);
        animateNumber("absentStudents", data.absent);
        animateNumber("lateStudents", data.late);

        // 4 Branches student counts
        if (data.department_stats) {
            const countMap = { 1: "count-cse", 2: "count-aids", 3: "count-bme", 4: "count-mech" };
            data.department_stats.forEach(ds => {
                const elId = countMap[ds.id];
                if (elId) {
                    const el = document.getElementById(elId);
                    if (el) el.textContent = `${ds.student_count} Students`;
                }
            });
        }
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

function animateNumber(elementId, finalNumber) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const duration = 600;
    const start = 0;
    const range = finalNumber - start;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        el.textContent = Math.floor(progress * range + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            el.textContent = finalNumber;
        }
    }
    window.requestAnimationFrame(step);
}

function showCurrentDate() {
    const element = document.getElementById("currentDate");
    if (!element) return;
    const today = new Date();
    element.textContent = today.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}


// ==========================================
// STUDENTS MANAGEMENT
// ==========================================

async function loadStudents() {
    try {
        let url = "/api/students";
        if (activeDeptFilter) {
            url += `?department_id=${activeDeptFilter}`;
        }

        const response = await fetch(url);
        if (response.status === 401) {
            window.location.href = "/login";
            return;
        }

        const data = await response.json();
        if (!data.success) return;

        allStudents = data.students;
        displayStudents(allStudents);
    } catch (error) {
        console.error("Students error:", error);
    }
}

function filterByDepartment(deptId, buttonElement) {
    activeDeptFilter = deptId;

    const pills = document.querySelectorAll(".dept-pill");
    pills.forEach(p => p.classList.remove("active"));
    if (buttonElement) {
        buttonElement.classList.add("active");
    }

    loadStudents();
}

function displayStudents(students) {
    const tbody = document.getElementById("studentTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 40px; color: var(--text-muted);">
                    No students found in this department. Click <strong>+ Add Single Student</strong> or <strong>⚡ Add Names List</strong> above!
                </td>
            </tr>
        `;
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.04}s both`;

        // Department Badge Class
        let deptClass = "dept-badge-default";
        const deptId = student.department_id;
        if (deptId === 1) deptClass = "dept-badge-cse";
        else if (deptId === 2) deptClass = "dept-badge-aids";
        else if (deptId === 3) deptClass = "dept-badge-bme";
        else if (deptId === 4) deptClass = "dept-badge-mech";

        row.innerHTML = `
            <td><strong>#${student.id}</strong></td>
            <td>
                <span class="code-badge">${escapeHtml(student.student_code)}</span>
            </td>
            <td>
                <strong>${escapeHtml(student.name)}</strong>
                ${student.phone ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${escapeHtml(student.phone)}</div>` : ""}
            </td>
            <td>
                <span class="dept-badge ${deptClass}">
                    ${escapeHtml(student.department_name || "Dept " + student.department_id)}
                </span>
            </td>
            <td><strong>Year ${student.year || "1"}</strong></td>
            <td><span class="section-tag">Sec ${escapeHtml(student.section || "A")}</span></td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent(${student.id})" title="Delete student">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function searchStudents() {
    const input = document.getElementById("studentSearch");
    if (!input) return;
    const search = input.value.toLowerCase().trim();

    const filtered = allStudents.filter(student => {
        const nameMatch = (student.name || "").toLowerCase().includes(search);
        const codeMatch = (student.student_code || "").toLowerCase().includes(search);
        const deptMatch = (student.department_name || "").toLowerCase().includes(search);
        return nameMatch || codeMatch || deptMatch;
    });

    displayStudents(filtered);
}


// ==========================================
// ADD SINGLE STUDENT
// ==========================================

function openStudentModal() {
    const modal = document.getElementById("studentModal");
    if (modal) {
        modal.style.display = "flex";
        autoGenerateStudentCode();
    }
}

function closeStudentModal() {
    const modal = document.getElementById("studentModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function autoGenerateStudentCode() {
    const deptSelect = document.getElementById("departmentId");
    const codeInput = document.getElementById("studentCode");
    if (!deptSelect || !codeInput) return;

    const deptPrefixes = { "1": "CSE", "2": "AIDS", "3": "BME", "4": "MECH" };
    const prefix = deptPrefixes[deptSelect.value] || "ST";

    if (!codeInput.value || codeInput.value.startsWith("CSE") || codeInput.value.startsWith("AIDS") || codeInput.value.startsWith("BME") || codeInput.value.startsWith("MECH") || codeInput.value.startsWith("ST")) {
        const randomNum = Math.floor(100 + Math.random() * 900);
        codeInput.value = `${prefix}${randomNum}`;
    }
}

async function addStudent(event) {
    event.preventDefault();

    const student = {
        department_id: document.getElementById("departmentId").value,
        student_code: document.getElementById("studentCode").value.trim(),
        name: document.getElementById("studentName").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
        phone: document.getElementById("studentPhone").value.trim(),
        gender: document.getElementById("studentGender").value,
        year: document.getElementById("studentYear").value,
        section: document.getElementById("studentSection").value.trim()
    };

    try {
        const response = await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });

        const data = await response.json();

        if (data.success) {
            showToast("Student added successfully!", "success");
            document.getElementById("studentForm").reset();
            closeStudentModal();
            loadStudents();
        } else {
            showToast(data.message || "Failed to add student", "error");
        }
    } catch (error) {
        console.error("Add student error:", error);
        showToast("Server connection failed", "error");
    }
}


// ==========================================
// BULK ADD STUDENT NAMES LIST (MANUAL ENTRY)
// ==========================================

function openBulkStudentModal() {
    const modal = document.getElementById("bulkStudentModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeBulkStudentModal() {
    const modal = document.getElementById("bulkStudentModal");
    if (modal) {
        modal.style.display = "none";
    }
}

async function handleBulkAddStudents(event) {
    event.preventDefault();

    const departmentId = document.getElementById("bulkDepartmentId").value;
    const year = document.getElementById("bulkYear").value;
    const section = document.getElementById("bulkSection").value.trim();
    const rawNames = document.getElementById("bulkStudentNames").value;

    const namesList = rawNames
        .split("\n")
        .map(n => n.trim())
        .filter(n => n.length > 0);

    if (namesList.length === 0) {
        showToast("Please enter at least one student name.", "warning");
        return;
    }

    const saveBtn = document.getElementById("bulkSaveBtn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Adding students...";
    }

    try {
        const response = await fetch("/api/students/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                department_id: departmentId,
                year: year,
                section: section,
                names: namesList
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Added ${data.count} students successfully!`, "success");
            document.getElementById("bulkStudentForm").reset();
            closeBulkStudentModal();
            loadStudents();
        } else {
            showToast(data.message || "Failed to add student list", "error");
        }
    } catch (error) {
        console.error("Bulk add error:", error);
        showToast("Server error during batch addition", "error");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Add All Students";
        }
    }
}


// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(studentId) {
    const confirmDelete = confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/api/students/${studentId}`, { method: "DELETE" });
        const data = await response.json();

        if (data.success) {
            showToast("Student deleted successfully", "success");
            loadStudents();
        } else {
            showToast(data.message || "Delete failed", "error");
        }
    } catch (error) {
        console.error("Delete error:", error);
        showToast("Server connection failed", "error");
    }
}


// ==========================================
// ATTENDANCE MANAGEMENT & LIVE STATS
// ==========================================

async function loadAttendance() {
    const dateInput = document.getElementById("attendanceDate");
    const deptSelect = document.getElementById("attendanceDepartment");

    const date = dateInput ? dateInput.value : getToday();
    const deptId = deptSelect ? deptSelect.value : "";

    let url = `/api/attendance?date=${date}`;
    if (deptId) {
        url += `&department_id=${deptId}`;
    }

    const tbody = document.getElementById("attendanceTableBody");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">
                    Loading attendance records...
                </td>
            </tr>
        `;
    }

    try {
        const response = await fetch(url);
        if (response.status === 401) {
            window.location.href = "/login";
            return;
        }

        const data = await response.json();
        if (!data.success) {
            showToast(data.message || "Unable to load attendance", "error");
            return;
        }

        displayAttendance(data.attendance);
    } catch (error) {
        console.error("Attendance error:", error);
        showToast("Failed to load attendance", "error");
    }
}

function displayAttendance(attendance) {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!attendance || attendance.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 40px; color: var(--text-muted);">
                    No students found for this department. Please add students first in the <a href="/students" style="color:var(--primary); font-weight:700; text-decoration:underline;">Students page</a>.
                </td>
            </tr>
        `;
        updateLiveAttendanceStats();
        return;
    }

    const currentTime = new Date().toTimeString().slice(0, 5);

    attendance.forEach((item, index) => {
        const row = document.createElement("tr");
        row.setAttribute("data-student-id", item.id);
        row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.03}s both`;

        const status = item.status || "Present";
        const checkIn = item.check_in || currentTime;
        const remarks = item.remarks || "";

        // Department badge class
        let deptClass = "dept-badge-default";
        if (item.department_id === 1) deptClass = "dept-badge-cse";
        else if (item.department_id === 2) deptClass = "dept-badge-aids";
        else if (item.department_id === 3) deptClass = "dept-badge-bme";
        else if (item.department_id === 4) deptClass = "dept-badge-mech";

        row.innerHTML = `
            <td>
                <span class="code-badge">${escapeHtml(item.student_code)}</span>
            </td>
            <td>
                <strong>${escapeHtml(item.name)}</strong>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                    Year ${item.year || 1} • Sec ${escapeHtml(item.section || "A")}
                </div>
            </td>
            <td>
                <span class="dept-badge ${deptClass}">
                    ${escapeHtml(item.department_name || "Dept " + item.department_id)}
                </span>
            </td>
            <td>
                <select class="attendance-select" id="status-${item.id}" onchange="updateLiveAttendanceStats()">
                    <option value="Present" ${status === "Present" ? "selected" : ""}>Present</option>
                    <option value="Absent" ${status === "Absent" ? "selected" : ""}>Absent</option>
                    <option value="Late" ${status === "Late" ? "selected" : ""}>Late</option>
                    <option value="Leave" ${status === "Leave" ? "selected" : ""}>Leave</option>
                </select>
            </td>
            <td>
                <input type="time" class="time-input" id="checkin-${item.id}" value="${checkIn}">
            </td>
            <td>
                <input type="text" class="remarks-input" id="remarks-${item.id}" value="${escapeHtml(remarks)}" placeholder="Remarks">
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="saveAttendance(${item.id})">
                    Save
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    // Update Live Stats Bar immediately after rendering
    updateLiveAttendanceStats();
}

// Live Attendance Counters Bar
function updateLiveAttendanceStats() {
    const rows = document.querySelectorAll("#attendanceTableBody tr[data-student-id]");
    const total = rows.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    rows.forEach(r => {
        const studentId = r.getAttribute("data-student-id");
        const select = document.getElementById(`status-${studentId}`);
        if (select) {
            const val = select.value;
            if (val === "Present") present++;
            else if (val === "Absent") absent++;
            else if (val === "Late") late++;
        }
    });

    const rate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0;

    const elTotal = document.getElementById("liveStatTotal");
    const elPresent = document.getElementById("liveStatPresent");
    const elAbsent = document.getElementById("liveStatAbsent");
    const elLate = document.getElementById("liveStatLate");
    const elRate = document.getElementById("liveStatRate");

    if (elTotal) elTotal.textContent = total;
    if (elPresent) elPresent.textContent = present;
    if (elAbsent) elAbsent.textContent = absent;
    if (elLate) elLate.textContent = late;
    if (elRate) elRate.textContent = `${rate}%`;

    // Apply absentees filter if active
    if (showingAbsenteesOnly) {
        applyAbsenteesFilter();
    }
}

// 1-Click: Mark All visible students as Present
function markAllPresent() {
    const selects = document.querySelectorAll(".attendance-select");
    if (selects.length === 0) {
        showToast("No students to mark.", "warning");
        return;
    }
    selects.forEach(s => {
        s.value = "Present";
    });
    updateLiveAttendanceStats();
    showToast(`Marked all ${selects.length} students as Present! Click "Save All" to commit.`, "info");
}

// Absentees-Only Filter Toggle
function toggleAbsenteesOnly() {
    showingAbsenteesOnly = !showingAbsenteesOnly;
    const btn = document.getElementById("toggleAbsenteesBtn");

    if (showingAbsenteesOnly) {
        if (btn) {
            btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Show All Students`;
            btn.classList.add("active");
        }
        applyAbsenteesFilter();
        showToast("Filtering: Showing only Absentees & Latecomers", "info");
    } else {
        if (btn) {
            btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Show Absentees Only`;
            btn.classList.remove("active");
        }
        // Show all rows
        const rows = document.querySelectorAll("#attendanceTableBody tr[data-student-id]");
        rows.forEach(r => r.style.display = "");
        showToast("Showing all students", "info");
    }
}

function applyAbsenteesFilter() {
    const rows = document.querySelectorAll("#attendanceTableBody tr[data-student-id]");
    rows.forEach(r => {
        const studentId = r.getAttribute("data-student-id");
        const select = document.getElementById(`status-${studentId}`);
        if (select) {
            if (select.value === "Present") {
                r.style.display = "none";
            } else {
                r.style.display = "";
            }
        }
    });
}

// Save single student attendance
async function saveAttendance(studentId) {
    const date = document.getElementById("attendanceDate").value || getToday();
    const status = document.getElementById(`status-${studentId}`).value;
    const checkIn = document.getElementById(`checkin-${studentId}`).value;
    const remarks = document.getElementById(`remarks-${studentId}`).value;

    try {
        const response = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_id: studentId,
                attendance_date: date,
                status: status,
                check_in: checkIn || null,
                remarks: remarks || null
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast("Attendance saved!", "success");
            const btn = document.querySelector(`button[onclick="saveAttendance(${studentId})"]`);
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = "Saved ✓";
                btn.style.background = "#10b981";
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = "";
                }, 1400);
            }
        } else {
            showToast(data.message || "Failed to save attendance", "error");
        }
    } catch (error) {
        console.error("Save attendance error:", error);
        showToast("Server connection failed", "error");
    }
}

// Save all visible students attendance in 1 click
async function saveAllAttendance() {
    const rows = document.querySelectorAll("#attendanceTableBody tr[data-student-id]");
    if (rows.length === 0) {
        showToast("No student records to save.", "warning");
        return;
    }

    const date = document.getElementById("attendanceDate").value || getToday();
    const records = [];

    rows.forEach(row => {
        const studentId = row.getAttribute("data-student-id");
        const statusEl = document.getElementById(`status-${studentId}`);
        const checkinEl = document.getElementById(`checkin-${studentId}`);
        const remarksEl = document.getElementById(`remarks-${studentId}`);

        if (studentId && statusEl) {
            records.push({
                student_id: parseInt(studentId),
                status: statusEl.value,
                check_in: checkinEl ? checkinEl.value : null,
                remarks: remarksEl ? remarksEl.value.trim() : null
            });
        }
    });

    try {
        const response = await fetch("/api/attendance/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                attendance_date: date,
                records: records
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message, "success");
            loadAttendance();
        } else {
            showToast(data.message || "Failed to save batch attendance", "error");
        }
    } catch (error) {
        console.error("Batch save error:", error);
        showToast("Server connection error during batch save", "error");
    }
}


// ==========================================
// CSV / EXCEL EXPORT (ADVANCED FEATURE)
// ==========================================

function exportAttendanceCSV() {
    const rows = document.querySelectorAll("#attendanceTableBody tr[data-student-id]");
    if (rows.length === 0) {
        showToast("No attendance data to export.", "warning");
        return;
    }

    const date = document.getElementById("attendanceDate").value || getToday();
    const deptSelect = document.getElementById("attendanceDepartment");
    const deptName = deptSelect && deptSelect.selectedIndex > 0 ? deptSelect.options[deptSelect.selectedIndex].text.split(" - ")[0] : "All_Departments";

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student Code,Student Name,Department,Status,Check In,Remarks,Date\n";

    rows.forEach(r => {
        const studentId = r.getAttribute("data-student-id");
        const code = r.querySelector(".code-badge") ? r.querySelector(".code-badge").textContent.trim() : "";
        const name = r.querySelector("strong") ? r.querySelector("strong").textContent.trim() : "";
        const dept = r.querySelector(".dept-badge") ? r.querySelector(".dept-badge").textContent.trim() : "";
        const status = document.getElementById(`status-${studentId}`) ? document.getElementById(`status-${studentId}`).value : "";
        const checkIn = document.getElementById(`checkin-${studentId}`) ? document.getElementById(`checkin-${studentId}`).value : "";
        const remarks = document.getElementById(`remarks-${studentId}`) ? document.getElementById(`remarks-${studentId}`).value.trim() : "";

        const rowStr = `"${code}","${name}","${dept}","${status}","${checkIn}","${remarks}","${date}"`;
        csvContent += rowStr + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AVCE_Attendance_${deptName}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Attendance exported: AVCE_Attendance_${deptName}_${date}.csv`, "success");
}

function exportStudentsCSV() {
    if (!allStudents || allStudents.length === 0) {
        showToast("No students to export.", "warning");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Student Code,Name,Department,Year,Section,Email,Phone,Gender\n";

    allStudents.forEach(s => {
        const rowStr = `"${s.id}","${s.student_code}","${s.name}","${s.department_name || ''}","${s.year || 1}","${s.section || 'A'}","${s.email || ''}","${s.phone || ''}","${s.gender || ''}"`;
        csvContent += rowStr + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AVCE_Students_Roster_${getToday()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Student roster exported to CSV successfully!", "success");
}


// ==========================================
// HELPERS
// ==========================================

function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Close modals when clicking outside
window.addEventListener("click", function (event) {
    const studentModal = document.getElementById("studentModal");
    if (studentModal && event.target === studentModal) {
        closeStudentModal();
    }
    const bulkModal = document.getElementById("bulkStudentModal");
    if (bulkModal && event.target === bulkModal) {
        closeBulkStudentModal();
    }
});
