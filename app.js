const app = document.querySelector("#app");
let issues = [
    {
      id: 1,
      title: "Button focus ring",
      status: "Open",
      priority: "High",
      assignee: "Ria",
    },
    {
      id: 2,
      title: "Mobile spacing",
      status: "In progress",
      priority: "Medium",
      assignee: "Omar",
    },
    {
      id: 3,
      title: "Copy review",
      status: "Open",
      priority: "Low",
      assignee: "Ria",
    },
  ],
  status = "all",
  priority = "all";
function render() {
  const view = issues
    .filter(
      (i) =>
        (status === "all" || i.status === status) &&
        (priority === "all" || i.priority === priority),
    )
    .sort((a, b) => (a.priority > b.priority ? -1 : 1));
  app.innerHTML = `<div class="row space"><div><span class="label">Triage queue</span><h2>${view.length} issues</h2></div><div class="row"><select id="status"><option value="all">All status</option><option>Open</option><option>In progress</option><option>Closed</option></select><select id="priority"><option value="all">All priority</option><option>High</option><option>Medium</option><option>Low</option></select></div></div><div class="list">${view.map((i) => `<article class="item"><div><strong>${i.title}</strong><span class="muted small">${i.assignee} · ${i.priority}</span></div><select data-status="${i.id}"><option ${i.status === "Open" ? "selected" : ""}>Open</option><option ${i.status === "In progress" ? "selected" : ""}>In progress</option><option ${i.status === "Closed" ? "selected" : ""}>Closed</option></select></article>`).join("")}</div>`;
  document.querySelector("#status").onchange = (e) => {
    status = e.target.value;
    render();
  };
  document.querySelector("#priority").onchange = (e) => {
    priority = e.target.value;
    render();
  };
  document.querySelectorAll("[data-status]").forEach(
    (s) =>
      (s.onchange = () => {
        issues = issues.map((i) =>
          i.id === Number(s.dataset.status)
            ? { ...i, status: s.value, assignee: "" }
            : i,
        );
        render();
      }),
  );
}
render();


// Added organizer feature: assignee totals.
function renderAssigneeSummary() {
  const host = document.querySelector("#app"); if (!host || document.querySelector("#assignee-summary")) return;
  const counts = issues.reduce((out, issue) => { const key = issue.assignee || "Unassigned"; out[key] = (out[key] || 0) + 1; return out; }, {});
  const summary = document.createElement("p"); summary.id = "assignee-summary"; summary.className = "muted small";
  summary.textContent = Object.entries(counts).map(([key, value]) => key + ": " + value).join(" · "); host.querySelector("h2")?.after(summary);
}
renderAssigneeSummary();


// Issue expansion: triage summary and unassigned queue.
(() => {
  const baseRender = render; let showUnassigned = false;
  const enhance = () => {
    if (document.querySelector("#triage-tools")) return;
    const panel = document.createElement("section"); panel.id = "triage-tools"; panel.className = "item";
    panel.innerHTML = '<strong>Triage tools</strong><label class="muted small"><input id="unassigned-only" type="checkbox"/> Unassigned only</label><p id="triage-summary" class="muted small"></p>';
    document.querySelector("#app")?.append(panel);
    const update = () => { const rows = showUnassigned ? issues.filter((issue) => !issue.assignee) : issues; panel.querySelector("#triage-summary").textContent = rows.length + " issue(s) in triage"; };
    panel.querySelector("#unassigned-only").onchange = (event) => { showUnassigned = event.target.checked; update(); };
    update();
  };
  render = () => { baseRender(); enhance(); };
  enhance();
})();
