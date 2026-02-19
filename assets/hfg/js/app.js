import { loadData, persistData, importFromJSON } from "./modules/dataStore.js";
import {
  renderProfile,
  renderOverview,
  renderResults,
  renderMarkbook,
  renderAnnouncements,
  renderStudentsTable,
  renderPagination
} from "./modules/render.js";
import { uid } from "./modules/utils.js";

const state = {
  data: null,
  madrasaIndex: 0,
  isAdmin: false,
  page: 1,
  pageSize: 5,
  query: "",
  class: "All Classes",
  gender: "All"
};

const $ = (id) => document.getElementById(id);
const elements = {
  loading: $("loadingOverlay"),
  madrasaSelect: $("madrasaSelect"),
  profileInfo: $("profileInfo"),
  dashboardCards: $("dashboardCards"),
  studentsTableBody: $("studentsTableBody"),
  studentsPagination: $("studentsPagination"),
  classFilter: $("classFilter"),
  genderFilter: $("genderFilter"),
  studentSearch: $("studentSearch"),
  resultsSummary: $("resultsSummary"),
  markbookArea: $("markbookArea"),
  announcementList: $("announcementList"),
  adminPanel: $("adminPanel"),
  adminToggle: $("adminToggle"),
  adminLoginForm: $("adminLoginForm"),
  adminState: $("adminState"),
  themeToggle: $("themeToggle")
};

function currentMadrasa() {
  return state.data.madrasas[state.madrasaIndex];
}

function refreshClassFilter() {
  const classes = [...new Set(currentMadrasa().students.map((s) => s.class))];
  elements.classFilter.innerHTML = ["All Classes", ...classes]
    .map((c) => `<option value="${c}">${c}</option>`).join("");
  elements.classFilter.value = state.class;
}

function filteredStudents() {
  return currentMadrasa().students.filter((s) =>
    s.name.toLowerCase().includes(state.query.toLowerCase()) &&
    (state.class === "All Classes" || s.class === state.class) &&
    (state.gender === "All" || s.gender === state.gender)
  );
}

function renderStudents() {
  const all = filteredStudents();
  const start = (state.page - 1) * state.pageSize;
  const paged = all.slice(start, start + state.pageSize);
  renderStudentsTable(elements.studentsTableBody, paged, state.isAdmin);
  renderPagination(elements.studentsPagination, state.page, Math.ceil(all.length / state.pageSize));
}

function renderEverything() {
  const madrasa = currentMadrasa();
  renderProfile(elements.profileInfo, madrasa);
  renderOverview(elements.dashboardCards, madrasa);
  renderResults(elements.resultsSummary, madrasa);
  renderMarkbook(elements.markbookArea, madrasa);
  renderAnnouncements(elements.announcementList, madrasa);
  refreshClassFilter();
  renderStudents();
  document.querySelectorAll(".admin-only").forEach((el) => el.classList.toggle("hidden", !state.isAdmin));
}

function populateDropdown() {
  elements.madrasaSelect.innerHTML = state.data.madrasas
    .map((m, i) => `<option value="${i}">${m.name}</option>`).join("");
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      $(btn.dataset.tab).classList.add("active");
    });
  });
}

function bindEvents() {
  elements.madrasaSelect.addEventListener("change", (e) => {
    state.madrasaIndex = Number(e.target.value);
    state.page = 1;
    renderEverything();
  });

  elements.studentSearch.addEventListener("input", (e) => {
    state.query = e.target.value;
    state.page = 1;
    renderStudents();
  });
  elements.classFilter.addEventListener("change", (e) => { state.class = e.target.value; state.page = 1; renderStudents(); });
  elements.genderFilter.addEventListener("change", (e) => { state.gender = e.target.value; state.page = 1; renderStudents(); });

  elements.studentsPagination.addEventListener("click", (e) => {
    if (e.target.dataset.page) {
      state.page = Number(e.target.dataset.page);
      renderStudents();
    }
  });

  elements.studentsTableBody.addEventListener("click", (e) => {
    if (!state.isAdmin) return;
    const { action, id } = e.target.dataset;
    if (!action || !id) return;
    if (action === "delete") {
      currentMadrasa().students = currentMadrasa().students.filter((s) => s.id !== id);
    }
    if (action === "edit") {
      const student = currentMadrasa().students.find((s) => s.id === id);
      const name = prompt("Update student name", student.name);
      if (name) student.name = name;
    }
    persistData(state.data);
    renderEverything();
  });

  $("addStudentBtn").addEventListener("click", () => {
    if (!state.isAdmin) return;
    const name = prompt("Student name");
    const cls = prompt("Class (e.g., Class 6)");
    const gender = prompt("Gender (Boy/Girl)", "Boy");
    if (!name || !cls || !gender) return;
    currentMadrasa().students.push({
      id: uid("S"), name, class: cls, gender,
      marks: { Quran: 0, Arabic: 0, Fiqh: 0, English: 0 }
    });
    persistData(state.data);
    renderEverything();
  });

  $("addResultBtn").addEventListener("click", () => {
    if (!state.isAdmin) return;
    const studentId = prompt("Student ID to add/update marks");
    const student = currentMadrasa().students.find((s) => s.id === studentId);
    if (!student) return alert("Student not found");
    ["Quran", "Arabic", "Fiqh", "English"].forEach((subject) => {
      const score = Number(prompt(`${subject} marks`, student.marks[subject] ?? 0));
      if (!Number.isNaN(score)) student.marks[subject] = score;
    });
    persistData(state.data);
    renderEverything();
  });

  $("addAnnouncementBtn").addEventListener("click", () => {
    if (!state.isAdmin) return;
    const title = prompt("Announcement title");
    const message = prompt("Announcement message");
    const urgent = confirm("Mark as urgent?");
    if (!title || !message) return;
    currentMadrasa().announcements.push({
      id: uid("A"), title, message,
      date: new Date().toISOString().split("T")[0],
      urgent
    });
    persistData(state.data);
    renderEverything();
  });

  elements.adminToggle.addEventListener("click", () => elements.adminPanel.classList.toggle("hidden"));

  elements.adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid = $("adminUser").value === "admin" && $("adminPass").value === "madrasa123";
    state.isAdmin = valid;
    elements.adminState.textContent = valid ? "Admin access granted. CRUD controls unlocked." : "Invalid credentials.";
    renderEverything();
  });

  $("jsonUpload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await importFromJSON(file);
      if (!data.madrasas || data.madrasas.length !== 13) throw new Error("Upload must contain exactly 13 madrasas.");
      state.data = data;
      state.madrasaIndex = 0;
      persistData(state.data);
      populateDropdown();
      renderEverything();
      alert("Data imported successfully.");
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  });

  $("printMarkbook").addEventListener("click", () => window.print());
  $("downloadPdf").addEventListener("click", () => {
    const popup = window.open("", "_blank");
    popup.document.write(`<html><head><title>Markbook PDF</title></head><body>${elements.markbookArea.innerHTML}</body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  });

  elements.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    elements.themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}

(async function init() {
  state.data = await loadData();
  populateDropdown();
  setupTabs();
  bindEvents();
  renderEverything();
  elements.loading.classList.add("hidden");
})();
