// Placement Tracker Frontend Application Logic
const API_BASE = ""; // Relative to server origin (e.g. http://127.0.0.1:8000)

let currentUser = null;
let allDrives = [];
let userApplications = [];
let isSignUpMode = false;

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  checkExistingAuth();
  loadDrives();
  loadRegisteredStudents();
});

// --- Auth Handling ---
function checkExistingAuth() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (token && storedUser) {
    currentUser = JSON.parse(storedUser);
    renderAuthNav();
    loadUserApplications();
    loadUserStats();
  } else {
    renderAuthNav();
  }
}

function renderAuthNav() {
  const container = document.getElementById("authNavContainer");
  if (currentUser) {
    container.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-800">${escapeHtml(currentUser.name)}</p>
          <p class="text-[11px] text-slate-500 font-medium">${currentUser.branch} • CGPA: <span class="text-indigo-600 font-semibold">${currentUser.cgpa}</span></p>
        </div>
        <button onclick="handleLogout()" title="Logout" class="text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 transition font-medium">
          <i class="fa-solid fa-arrow-right-from-bracket sm:mr-1"></i>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    `;
    document.getElementById("metricsBar").classList.remove("hidden");
  } else {
    container.innerHTML = `
      <button onclick="openAuthModal()" class="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-sm flex items-center space-x-1.5">
        <i class="fa-solid fa-user"></i>
        <span>Sign In</span>
      </button>
    `;
    document.getElementById("metricsBar").classList.add("hidden");
  }
}

function openAuthModal() {
  document.getElementById("authModal").classList.remove("hidden");
}

function closeAuthModal() {
  document.getElementById("authModal").classList.add("hidden");
}

function fillDemoStudent() {
  document.getElementById("authEmail").value = "demo@student.edu";
  document.getElementById("authPassword").value = "password123";
  if (isSignUpMode) toggleAuthMode();
}

function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  document.getElementById("authTitle").innerText = isSignUpMode ? "Create Student Account" : "Student Sign In";
  document.getElementById("authSubmitBtn").innerText = isSignUpMode ? "Create Account" : "Sign In";
  document.getElementById("authTogglePrompt").innerText = isSignUpMode ? "Already registered?" : "Don't have an account?";
  document.getElementById("authToggleBtn").innerText = isSignUpMode ? "Sign In" : "Sign Up";
  document.getElementById("nameField").classList.toggle("hidden", !isSignUpMode);
  document.getElementById("studentDetailsFields").classList.toggle("hidden", !isSignUpMode);
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

  const url = isSignUpMode ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;
  const payload = isSignUpMode ? {
    name: document.getElementById("authName").value.trim(),
    email,
    password,
    branch: document.getElementById("authBranch").value.trim(),
    cgpa: parseFloat(document.getElementById("authCgpa").value) || 7.5
  } : { email, password };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Authentication failed");

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    currentUser = data.user;
    closeAuthModal();
    renderAuthNav();
    loadUserApplications();
    loadUserStats();
    showToast(`Welcome, ${currentUser.name}!`);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  currentUser = null;
  userApplications = [];
  renderAuthNav();
  renderDrives();
  renderApplications();
  showToast("Logged out successfully");
}

// --- Drives Handling ---
async function loadDrives() {
  try {
    const res = await fetch(`${API_BASE}/api/drives`);
    allDrives = await res.json();
    document.getElementById("drivesBadge").innerText = allDrives.length;
    renderDrives();
  } catch (err) {
    showToast("Error loading recruitment drives", "error");
  }
}

function filterDrives() {
  renderDrives();
}

function renderDrives() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const minPkg = parseFloat(document.getElementById("packageFilter").value) || 0;
  const grid = document.getElementById("drivesGrid");

  const filtered = allDrives.filter(d => {
    const matchesSearch = d.company_name.toLowerCase().includes(search) || d.role_title.toLowerCase().includes(search);
    const matchesPkg = d.package_lpa >= minPkg;
    return matchesSearch && matchesPkg;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200">
        <i class="fa-solid fa-folder-open text-4xl text-slate-300 mb-3"></i>
        <p class="text-sm font-semibold text-slate-600">No recruitment drives found</p>
        <p class="text-xs text-slate-400 mt-1">Try adjusting your search criteria or min package filter.</p>
      </div>
    `;
    return;
  }

  const appliedDriveIds = new Set(userApplications.map(a => a.drive_id));

  grid.innerHTML = filtered.map(drive => {
    const isApplied = appliedDriveIds.has(drive.id);
    const isEligible = !currentUser || (currentUser.cgpa >= drive.min_cgpa);

    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between mb-3">
            <div>
              <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                ${drive.package_lpa} LPA
              </span>
              <h3 class="font-bold text-slate-900 text-lg leading-snug">${escapeHtml(drive.company_name)}</h3>
              <p class="text-xs font-medium text-slate-500">${escapeHtml(drive.role_title)}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
              ${escapeHtml(drive.company_name.charAt(0))}
            </div>
          </div>

          <p class="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            ${escapeHtml(drive.description || "Exciting SDE role working on scalable systems.")}
          </p>

          <div class="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <div class="flex items-center justify-between">
              <span><i class="fa-regular fa-calendar-check mr-1.5 text-slate-400"></i>Deadline:</span>
              <span class="font-semibold text-slate-700">${drive.deadline}</span>
            </div>
            <div class="flex items-center justify-between">
              <span><i class="fa-solid fa-graduation-cap mr-1.5 text-slate-400"></i>Min CGPA:</span>
              <span class="font-semibold ${isEligible ? 'text-slate-700' : 'text-rose-600'}">${drive.min_cgpa}</span>
            </div>
            ${drive.oa_date ? `
            <div class="flex items-center justify-between">
              <span><i class="fa-solid fa-laptop-code mr-1.5 text-amber-500"></i>OA Date:</span>
              <span class="font-semibold text-amber-600">${drive.oa_date}</span>
            </div>` : ''}
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100">
          ${isApplied ? `
            <button disabled class="w-full py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default flex items-center justify-center space-x-1">
              <i class="fa-solid fa-check"></i>
              <span>Already Applied</span>
            </button>
          ` : `
            <button onclick="applyToDrive(${drive.id}, ${drive.min_cgpa})" class="w-full py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center space-x-1.5 ${
              isEligible 
                ? 'bg-slate-900 hover:bg-indigo-600 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }">
              <span>${isEligible ? 'Apply For Drive' : 'Ineligible (Low CGPA)'}</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          `}
        </div>
      </div>
    `;
  }).join("");
}

// --- Apply Functionality ---
async function applyToDrive(driveId, minCgpa) {
  if (!currentUser) {
    openAuthModal();
    return;
  }

  if (currentUser.cgpa < minCgpa) {
    showToast(`Ineligible: Your CGPA (${currentUser.cgpa}) is lower than the required ${minCgpa}`, "error");
    return;
  }

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ drive_id: driveId, notes: "Application submitted via campus portal." })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Application failed");

    showToast("Application submitted successfully!");
    loadUserApplications();
    loadUserStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// --- User Applications & Pipeline ---
async function loadUserApplications() {
  if (!currentUser) return;
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/api/applications`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    userApplications = await res.json();
    document.getElementById("appsBadge").innerText = userApplications.length;
    renderDrives();
    renderApplications();
  } catch (err) {
    console.error(err);
  }
}

async function loadUserStats() {
  if (!currentUser) return;
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/api/applications/stats`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const stats = await res.json();
    document.getElementById("statTotal").innerText = stats.total_applied;
    document.getElementById("statOA").innerText = stats.oa_scheduled;
    document.getElementById("statInterviews").innerText = stats.interview_shortlisted;
    document.getElementById("statOffers").innerText = stats.offered;
  } catch (err) {
    console.error(err);
  }
}

function renderApplications() {
  const container = document.getElementById("appsList");
  if (!currentUser) {
    container.innerHTML = `
      <div class="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <i class="fa-solid fa-lock text-4xl text-slate-300 mb-3"></i>
        <p class="text-sm font-semibold text-slate-600">Please sign in to view your applications</p>
        <button onclick="openAuthModal()" class="mt-3 text-xs bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg">Sign In Now</button>
      </div>
    `;
    return;
  }

  if (userApplications.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <i class="fa-solid fa-list-check text-4xl text-slate-300 mb-3"></i>
        <p class="text-sm font-semibold text-slate-600">No applications submitted yet</p>
        <p class="text-xs text-slate-400 mt-1">Browse campus drives and submit your first application!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = userApplications.map(app => {
    const drive = app.drive || {};
    const statusClasses = {
      "Applied": "status-applied",
      "OA_Scheduled": "status-oa",
      "Interview_Shortlisted": "status-interview",
      "Offered": "status-offered",
      "Rejected": "status-rejected"
    };

    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-1.5">
            <h4 class="font-bold text-slate-900 text-base">${escapeHtml(drive.company_name || 'Company')}</h4>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusClasses[app.status] || 'bg-slate-100'}">
              ${app.status.replace('_', ' ')}
            </span>
          </div>
          <p class="text-xs text-slate-500">${escapeHtml(drive.role_title || 'SDE Role')} • Package: <strong>${drive.package_lpa || 0} LPA</strong></p>
          <div class="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start space-x-2">
            <i class="fa-regular fa-comment-dots text-slate-400 mt-0.5"></i>
            <span class="flex-1 italic">${escapeHtml(app.notes || 'No custom notes added.')}</span>
            <button onclick="editNotesPrompt(${app.id}, '${escapeHtml(app.notes || '')}')" class="text-indigo-600 hover:underline font-semibold ml-2">Edit</button>
          </div>
        </div>

        <!-- Status Controller -->
        <div class="flex items-center space-x-3 border-t md:border-t-0 pt-3 md:pt-0">
          <div class="flex flex-col">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Update Status</label>
            <select onchange="updateAppStatus(${app.id}, this.value)" class="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none">
              <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
              <option value="OA_Scheduled" ${app.status === 'OA_Scheduled' ? 'selected' : ''}>OA Scheduled</option>
              <option value="Interview_Shortlisted" ${app.status === 'Interview_Shortlisted' ? 'selected' : ''}>Interview Shortlisted</option>
              <option value="Offered" ${app.status === 'Offered' ? 'selected' : ''}>Offered 🎉</option>
              <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function updateAppStatus(appId, newStatus) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/api/applications/${appId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error("Status update failed");
    showToast(`Status updated to ${newStatus.replace('_', ' ')}`);
    loadUserApplications();
    loadUserStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function editNotesPrompt(appId, currentNotes) {
  const newNotes = prompt("Enter interview / test prep notes for this drive:", currentNotes);
  if (newNotes === null) return;

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/api/applications/${appId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ notes: newNotes })
    });
    if (!res.ok) throw new Error("Notes update failed");
    showToast("Notes updated successfully");
    loadUserApplications();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// --- Create New Drive (Coordinator) ---
function openNewDriveModal() {
  if (!currentUser) {
    openAuthModal();
    return;
  }
  document.getElementById("driveModal").classList.remove("hidden");
}

function closeNewDriveModal() {
  document.getElementById("driveModal").classList.add("hidden");
}

async function handleCreateDrive(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const payload = {
    company_name: document.getElementById("newCompName").value.trim(),
    role_title: document.getElementById("newRoleTitle").value.trim(),
    package_lpa: parseFloat(document.getElementById("newPackage").value),
    min_cgpa: parseFloat(document.getElementById("newMinCgpa").value),
    deadline: document.getElementById("newDeadline").value,
    oa_date: document.getElementById("newOADate").value || null,
    location: document.getElementById("newLocation").value.trim() || "Remote / Hybrid",
    description: document.getElementById("newDesc").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/drives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Could not publish drive");

    closeNewDriveModal();
    showToast(`Published recruitment drive for ${data.company_name}!`);
    loadDrives();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// --- Tab Switching ---
function switchTab(tab) {
  const drivesTab = document.getElementById("drivesTab");
  const appsTab = document.getElementById("appsTab");
  const studentsTab = document.getElementById("studentsTab");

  const drivesBtn = document.getElementById("tabDrivesBtn");
  const appsBtn = document.getElementById("tabAppsBtn");
  const studentsBtn = document.getElementById("tabStudentsBtn");

  // Reset all tabs
  drivesTab.classList.add("hidden");
  appsTab.classList.add("hidden");
  studentsTab.classList.add("hidden");

  const inactiveClass = "pb-3 font-medium text-sm text-slate-500 hover:text-slate-800 flex items-center space-x-2";
  const activeClass = "pb-3 font-semibold text-sm border-b-2 border-indigo-600 text-indigo-600 flex items-center space-x-2";

  drivesBtn.className = inactiveClass;
  appsBtn.className = inactiveClass;
  studentsBtn.className = inactiveClass;

  if (tab === "drives") {
    drivesTab.classList.remove("hidden");
    drivesBtn.className = activeClass;
  } else if (tab === "apps") {
    appsTab.classList.remove("hidden");
    appsBtn.className = activeClass;
    loadUserApplications();
  } else if (tab === "students") {
    studentsTab.classList.remove("hidden");
    studentsBtn.className = activeClass;
    loadRegisteredStudents();
  }
}

// --- Registered Students Directory ---
async function loadRegisteredStudents() {
  try {
    const res = await fetch(`${API_BASE}/api/applications/registered-students`);
    if (!res.ok) return;
    const data = await res.json();

    const badge = document.getElementById("studentsBadge");
    const totalCount = document.getElementById("totalStudentsCount");
    if (badge) badge.innerText = data.total_students;
    if (totalCount) totalCount.innerText = data.total_students;

    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;

    if (data.students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-8 text-slate-400">No students registered in database yet.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.students.map(s => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-4 px-6 flex items-center space-x-3">
          <div class="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
            ${escapeHtml(s.name.charAt(0).toUpperCase())}
          </div>
          <div>
            <p class="font-bold text-slate-800 text-sm">${escapeHtml(s.name)}</p>
            <p class="text-xs text-slate-400">${escapeHtml(s.email)}</p>
          </div>
        </td>
        <td class="py-4 px-6">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            ${escapeHtml(s.branch)}
          </span>
        </td>
        <td class="py-4 px-6 font-bold ${s.cgpa >= 8.0 ? 'text-emerald-600' : 'text-slate-700'}">
          ${s.cgpa.toFixed(2)}
        </td>
        <td class="py-4 px-6 font-semibold text-slate-700">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${s.applications_count > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-50 text-slate-400'}">
            ${s.applications_count} applied
          </span>
        </td>
        <td class="py-4 px-6 text-xs text-slate-400">
          ${s.created_at}
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error loading registered students:", err);
  }
}

// --- Toast Utility ---
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  const icon = document.getElementById("toastIcon");
  document.getElementById("toastMsg").innerText = msg;

  if (type === "error") {
    toast.className = "fixed bottom-6 right-6 bg-rose-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm z-50 transition transform duration-300 translate-y-0 opacity-100";
    icon.className = "fa-solid fa-circle-exclamation text-rose-400";
  } else {
    toast.className = "fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm z-50 transition transform duration-300 translate-y-0 opacity-100";
    icon.className = "fa-solid fa-circle-check text-emerald-400";
  }

  setTimeout(() => {
    toast.className = "fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm z-50 transition transform translate-y-20 opacity-0 duration-300";
  }, 3000);
}

function escapeHtml(text) {
  if (!text) return "";
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
