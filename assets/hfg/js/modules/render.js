import { formatDate, gradeFromAverage } from "./utils.js";

export function renderProfile(el, madrasa) {
  el.innerHTML = `${madrasa.id} • ${madrasa.location} • Principal: ${madrasa.principal} • Founded: ${madrasa.founded}`;
}

export function renderOverview(el, madrasa) {
  const boys = madrasa.students.filter((s) => s.gender === "Boy").length;
  const girls = madrasa.students.filter((s) => s.gender === "Girl").length;
  const cards = [
    ["Total Students", madrasa.students.length],
    ["Total Boys", boys],
    ["Total Girls", girls],
    ["Latest Exam Conducted", madrasa.latestExam],
    ["Pass Percentage", `${madrasa.passPercentage}%`]
  ];
  el.innerHTML = cards.map(([label, value]) => `
    <article class="dashboard-card">
      <h3>${label}</h3>
      <strong>${value}</strong>
    </article>
  `).join("");
}

export function renderResults(el, madrasa) {
  const rows = madrasa.students.map((s) => {
    const marks = Object.values(s.marks);
    const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
    return `<div class="summary-box"><strong>${s.name}</strong><p>Average: ${avg.toFixed(1)} | Grade: ${gradeFromAverage(avg)}</p></div>`;
  }).join("");
  el.innerHTML = rows || "<p>No result entries yet.</p>";
}

export function renderMarkbook(el, madrasa) {
  el.innerHTML = madrasa.students.map((s) => {
    const subjects = Object.entries(s.marks).map(([subject, mark]) => `<li>${subject}: ${mark}</li>`).join("");
    const avg = Object.values(s.marks).reduce((a, b) => a + b, 0) / Object.keys(s.marks).length;
    return `
      <article class="mark-row">
        <h4>${s.name} (${s.class})</h4>
        <ul>${subjects}</ul>
        <strong>Average: ${avg.toFixed(2)} • Grade: ${gradeFromAverage(avg)}</strong>
      </article>
    `;
  }).join("") || "<p>No students available for mark book.</p>";
}

export function renderAnnouncements(el, madrasa) {
  const sorted = [...madrasa.announcements].sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = sorted.map((a) => `
    <article class="announcement ${a.urgent ? "urgent" : ""}">
      <h4>${a.title}${a.urgent ? " • URGENT" : ""}</h4>
      <p>${a.message}</p>
      <small>${formatDate(a.date)}</small>
    </article>
  `).join("") || "<p>No announcements yet.</p>";
}

export function renderStudentsTable(el, students, isAdmin) {
  el.innerHTML = students.map((s) => `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.class}</td>
      <td>${s.gender}</td>
      <td class="admin-only ${isAdmin ? "" : "hidden"}">
        <button data-action="edit" data-id="${s.id}" class="btn small btn-outline">Edit</button>
        <button data-action="delete" data-id="${s.id}" class="btn small btn-outline">Delete</button>
      </td>
    </tr>
  `).join("") || '<tr><td colspan="5">No matching students found.</td></tr>';
}

export function renderPagination(el, page, totalPages) {
  if (totalPages <= 1) {
    el.innerHTML = "";
    return;
  }
  const buttons = [];
  for (let i = 1; i <= totalPages; i += 1) {
    buttons.push(`<button class="btn ${i === page ? "btn-primary" : "btn-outline"}" data-page="${i}">${i}</button>`);
  }
  el.innerHTML = buttons.join("");
}
