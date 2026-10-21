// Initial State & Data Persistence
const STORAGE_KEY = 'bugbash_issue_tracker_data';

const initialIssues = [
  {
    id: 'ISSUE-101',
    title: 'Fix mobile layout overflow in navigation bar',
    status: 'open',
    priority: 'high',
    assignee: 'Vishal'
  },
  {
    id: 'ISSUE-102',
    title: 'Resolve memory leak during image upload',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Aman'
  },
  {
    id: 'ISSUE-103',
    title: 'Update landing page headline copy',
    status: 'closed',
    priority: 'low',
    assignee: 'Unassigned'
  }
];

let issues = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialIssues;

// Save to LocalStorage
function saveIssues() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

// Priority Weights for Sorting
const priorityMap = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

// Render Issues
function renderIssues() {
  const issueList = document.getElementById('issue-list');
  const statusFilter = document.getElementById('filter-status').value;
  const priorityFilter = document.getElementById('filter-priority').value;
  const searchFilter = document.getElementById('filter-search').value.toLowerCase().trim();
  const sortBy = document.getElementById('sort-by').value;

  if (!issueList) return;

  // Filter Issues
  let filtered = issues.filter(issue => {
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesSearch = issue.title.toLowerCase().includes(searchFilter) || 
                          issue.id.toLowerCase().includes(searchFilter) ||
                          issue.assignee.toLowerCase().includes(searchFilter);
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Sort Issues
  filtered.sort((a, b) => {
    if (sortBy === 'priority-desc') {
      return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
    } else if (sortBy === 'priority-asc') {
      return (priorityMap[a.priority] || 0) - (priorityMap[b.priority] || 0);
    } else if (sortBy === 'id-asc') {
      return a.id.localeCompare(b.id);
    }
    return 0;
  });

  // Render HTML Output
  if (filtered.length === 0) {
    issueList.innerHTML = '<div class="empty-state">No issues match the selected filters.</div>';
    return;
  }

  issueList.innerHTML = filtered.map(issue => `
    <div class="issue-card" data-id="${issue.id}">
      <div class="issue-header">
        <span class="issue-id">${issue.id}</span>
        <span class="badge priority-${issue.priority}">${issue.priority.toUpperCase()}</span>
      </div>
      <div class="issue-title">${issue.title}</div>
      <div class="issue-controls">
        <label>
          Status:
          <select class="status-select" onchange="updateStatus('${issue.id}', this.value)">
            <option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option>
            <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>Closed</option>
          </select>
        </label>
        <label>
          Assignee:
          <input type="text" class="assignee-input" value="${issue.assignee}" onchange="updateAssignee('${issue.id}', this.value)" placeholder="Unassigned" />
        </label>
        <button class="btn-delete" onclick="deleteIssue('${issue.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Actions
function updateStatus(id, newStatus) {
  issues = issues.map(issue => issue.id === id ? { ...issue, status: newStatus } : issue);
  saveIssues();
  renderIssues();
}

function updateAssignee(id, newAssignee) {
  issues = issues.map(issue => issue.id === id ? { ...issue, assignee: newAssignee.trim() || 'Unassigned' } : issue);
  saveIssues();
  renderIssues();
}

function deleteIssue(id) {
  issues = issues.filter(issue => issue.id !== id);
  saveIssues();
  renderIssues();
}

function createIssue(event) {
  event.preventDefault();
  const titleInput = document.getElementById('new-title');
  const priorityInput = document.getElementById('new-priority');
  const assigneeInput = document.getElementById('new-assignee');

  if (!titleInput.value.trim()) return;

  const nextIssueNumber = issues.reduce((highest, issue) => {
    const match = /^ISSUE-(\d+)$/.exec(issue.id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 100) + 1;

  const newIssue = {
    id: `ISSUE-${nextIssueNumber}`,
    title: titleInput.value.trim(),
    status: 'open',
    priority: priorityInput.value,
    assignee: assigneeInput.value.trim() || 'Unassigned'
  };

  issues.push(newIssue);
  saveIssues();
  renderIssues();

  titleInput.value = '';
  assigneeInput.value = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderIssues();

  document.getElementById('filter-status')?.addEventListener('change', renderIssues);
  document.getElementById('filter-priority')?.addEventListener('change', renderIssues);
  document.getElementById('filter-search')?.addEventListener('input', renderIssues);
  document.getElementById('sort-by')?.addEventListener('change', renderIssues);
  document.getElementById('create-issue-form')?.addEventListener('submit', createIssue);
});