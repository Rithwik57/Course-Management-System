// ========== MOCK DATA ==========
const DEFAULT_USERS = [
  { id: 1, name: "Alice Johnson", email: "alice@uni.edu", role: "student", password: "student123" },
  { id: 2, name: "Dr. Robert Smith", email: "robert@uni.edu", role: "faculty", password: "faculty123" },
  { id: 3, name: "Carol Admin", email: "carol@uni.edu", role: "admin", password: "admin123" },
];

const DEFAULT_COURSES = [
  { id: 1, title: "Cloud Computing", details: "Intro to cloud platforms.", semester: "Fall 2025", enrollStatus: "Open", facultyId: 2 },
  { id: 2, title: "Data Structures", details: "Core CS algorithms.", semester: "Fall 2025", enrollStatus: "Open", facultyId: 2 },
  { id: 3, title: "Web Development", details: "Full-stack with Node+React.", semester: "Spring 2026", enrollStatus: "Closed", facultyId: 2 },
  { id: 4, title: "Machine Learning", details: "Supervised learning basics.", semester: "Spring 2026", enrollStatus: "Open", facultyId: 2 },
  { id: 5, title: "Database Systems", details: "SQL, NoSQL, schema design.", semester: "Fall 2025", enrollStatus: "Waitlisted", facultyId: 2 },
];

const DEFAULT_ENROLLMENTS = [
  { studentId: 1, courseId: 1 },
  { studentId: 1, courseId: 3 },
];

const DEFAULT_SETTINGS = {
  allowSelfEnrollment: true,
  maintenanceMode: false,
  maxEnrollment: 30,
  activeSemesters: ["Fall 2025", "Spring 2026"],
};

// ========== STATE MANAGEMENT ==========
function getState() {
  try {
    const s = JSON.parse(localStorage.getItem('mycourses_state'));
    if (s && s.users) return s;
  } catch(e) {}
  return null;
}

function initState() {
  if (!getState()) {
    saveState({
      users: DEFAULT_USERS,
      courses: DEFAULT_COURSES,
      enrollments: DEFAULT_ENROLLMENTS,
      settings: DEFAULT_SETTINGS,
    });
  }
}

function saveState(state) {
  localStorage.setItem('mycourses_state', JSON.stringify(state));
}

function getUsers() { return getState().users; }
function getCourses() { return getState().courses; }
function getEnrollments() { return getState().enrollments; }
function getSettings() { return getState().settings; }

function setUsers(users) { const s = getState(); s.users = users; saveState(s); }
function setCourses(courses) { const s = getState(); s.courses = courses; saveState(s); }
function setEnrollments(enrollments) { const s = getState(); s.enrollments = enrollments; saveState(s); }
function setSettingsState(settings) { const s = getState(); s.settings = settings; saveState(s); }

// ========== AUTH ==========
function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem('mycourses_user')); } catch(e) { return null; }
}

function setCurrentUser(user) {
  if (user) sessionStorage.setItem('mycourses_user', JSON.stringify(user));
  else sessionStorage.removeItem('mycourses_user');
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) { setCurrentUser(user); return user; }
  return null;
}

function logout() {
  setCurrentUser(null);
  window.location.href = getBasePath() + 'index.html';
}

function register(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) return null;
  const id = Math.max(0, ...users.map(u => u.id)) + 1;
  const newUser = { id, name, email, role: "student", password };
  users.push(newUser);
  setUsers(users);
  setCurrentUser(newUser);
  return newUser;
}

// ========== ROUTE GUARD ==========
function requireAuth(allowedRole) {
  const user = getCurrentUser();
  if (!user) { window.location.href = getBasePath() + 'index.html'; return null; }
  if (user.role !== allowedRole) {
    window.location.href = getBasePath() + getDashboardPath(user.role);
    return null;
  }
  return user;
}

function getDashboardPath(role) {
  if (role === 'student') return 'student/dashboard.html';
  if (role === 'faculty') return 'faculty/dashboard.html';
  return 'admin/dashboard.html';
}

function getBasePath() {
  const path = window.location.pathname;
  // If we're in a subdirectory (student/, faculty/, admin/), go up one level
  if (path.includes('/student/') || path.includes('/faculty/') || path.includes('/admin/')) {
    return '../';
  }
  return '';
}

// ========== ENROLLMENT ACTIONS ==========
function enrollStudent(studentId, courseId) {
  const enrollments = getEnrollments();
  if (!enrollments.find(e => e.studentId === studentId && e.courseId === courseId)) {
    enrollments.push({ studentId, courseId });
    setEnrollments(enrollments);
  }
}

function dropStudent(studentId, courseId) {
  const enrollments = getEnrollments();
  setEnrollments(enrollments.filter(e => !(e.studentId === studentId && e.courseId === courseId)));
}

// ========== COURSE ACTIONS ==========
function addCourse(course) {
  const courses = getCourses();
  const id = Math.max(0, ...courses.map(c => c.id)) + 1;
  courses.push({ ...course, id });
  setCourses(courses);
  return id;
}

function updateCourse(id, data) {
  const courses = getCourses();
  const idx = courses.findIndex(c => c.id === id);
  if (idx !== -1) { courses[idx] = { ...courses[idx], ...data }; setCourses(courses); }
}

function deleteCourse(id) {
  setCourses(getCourses().filter(c => c.id !== id));
  setEnrollments(getEnrollments().filter(e => e.courseId !== id));
}

// ========== USER ACTIONS ==========
function updateUser(id, data) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) { users[idx] = { ...users[idx], ...data }; setUsers(users); }
}

// ========== UI HELPERS ==========
function renderNavbar(user) {
  const base = getBasePath();
  const dashHref = base + getDashboardPath(user.role);
  return `
    <nav class="navbar">
      <div class="navbar-inner">
        <a href="${dashHref}" class="navbar-brand">
          <div class="navbar-logo">🎓</div>
          <span class="navbar-title">MyCourses</span>
        </a>
        <div class="navbar-right">
          <span class="navbar-user hidden-sm">${user.name}</span>
          <span class="badge badge-${user.role}">${user.role}</span>
          <button class="btn-logout" onclick="logout()">🚪 <span class="hidden-sm">Logout</span></button>
        </div>
      </div>
    </nav>`;
}

function statusBadge(status) {
  const cls = status === 'Open' ? 'open' : status === 'Closed' ? 'closed' : 'waitlisted';
  return `<span class="badge badge-${cls}">${status}</span>`;
}

function roleBadge(role) {
  return `<span class="badge badge-${role}">${role}</span>`;
}

function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Init state on every page
initState();
