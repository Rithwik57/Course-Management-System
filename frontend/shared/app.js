const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
const BASE_URL = isLocalhost ? "http://localhost:5000/api" : "/api";

function getToken() {
  return localStorage.getItem("token");
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

async function login(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!data.success) return null;

    localStorage.setItem("token", data.data.token);
    setCurrentUser(data.data.user);

    return data.data.user;
  } catch (err) {
    console.error("Login failed:", err);
    return null;
  }
}

async function handleGoogleLogin(response) {
  try {
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();
    if (!data.success) {
      const err = document.getElementById("error");
      if(err) { err.style.display = "flex"; err.textContent = "⚠ Google auth failed."; }
      return;
    }
    localStorage.setItem("token", data.data.token);
    setCurrentUser(data.data.user);
    window.location.href = getBasePath() + getDashboardPath(data.data.user.role);
  } catch(err) {
    console.error("Google Login Error", err);
  }
}

async function register(name, email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!data.success) return null;

    return data.data;
  } catch (err) {
    console.error("Register failed:", err);
    return null;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = getBasePath() + "index.html";
}

function requireAuth(allowedRole) {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    window.location.href = "../index.html";
    return null;
  }

  if (allowedRole && user.role !== allowedRole) {
    window.location.href = "../" + getDashboardPath(user.role);
    return null;
  }

  return user;
}

function getDashboardPath(role) {
  if (role === "student") return "student/dashboard.html";
  if (role === "faculty") return "faculty/dashboard.html";
  return "admin/dashboard.html";
}

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes("/student/") || path.includes("/faculty/") || path.includes("/admin/")) {
    return "../";
  }
  return "";
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
  };
}

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
  const cls = status === "Open" ? "open" : status === "Closed" ? "closed" : "waitlisted";
  return `<span class="badge badge-${cls}">${status}</span>`;
}

function roleBadge(role) {
  return `<span class="badge badge-${role}">${role}</span>`;
}

function showToast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// --- API helpers ---

async function apiGet(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { headers: getAuthHeaders() });
    return res.json();
  } catch (e) {
    return { success: false, message: "Network error" };
  }
}

async function apiPost(path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return res.json();
  } catch (e) {
    return { success: false, message: "Network error" };
  }
}

async function apiPut(path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return res.json();
  } catch (e) {
    return { success: false, message: "Network error" };
  }
}

async function apiDelete(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.json();
  } catch (e) {
    return { success: false, message: "Network error" };
  }
}