// src/api.js — Centralised API client for Job Portal

const DEFAULT_BACKEND_URL = "https://job-listing-app-uqx4.onrender.com";
const LOCAL_BACKEND_URL = "http://localhost:5000";

export function getBackendBase() {
  const override = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
  if (override) return override.replace(/\/$/, "");

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return LOCAL_BACKEND_URL;
  }

  return DEFAULT_BACKEND_URL;
}

const BACKEND_BASE = getBackendBase();
const API_BASE = `${BACKEND_BASE}/api`;

// ─── Token helper ──────────────────────────────────────────────
function getToken() {
  try {
    return localStorage.getItem("jb_token");
  } catch {
    return null;
  }
}

// ─── Core fetch wrapper ────────────────────────────────────────
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed with ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ─── Multipart (file upload) helper ───────────────────────────
async function uploadFile(path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    throw new Error(data?.message || `Upload failed with ${res.status}`);
  }
  return data;
}

/* ======================
   AUTH
   ====================== */

export async function apiSignup(body) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiLogin(body) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiSocialAuth(body) {
  return request("/auth/social", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* ======================
   JOBS
   ====================== */

export async function apiGetJobs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/jobs${qs ? "?" + qs : ""}`, { method: "GET" });
}

export async function apiGetJobById(jobId) {
  return request(`/jobs/${jobId}`, { method: "GET" });
}

export async function apiCreateJob(job) {
  return request("/jobs", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

export async function apiUpdateJob(jobId, body) {
  return request(`/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiDeleteJob(jobId) {
  return request(`/jobs/${jobId}`, { method: "DELETE" });
}

/* ======================
   APPLICATIONS
   ====================== */

// Job seeker applies to a job (with optional cover letter)
export async function apiApplyJob(jobId, coverLetter = "") {
  return request(`/jobs/${jobId}/apply`, {
    method: "POST",
    body: JSON.stringify({ coverLetter }),
  });
}

// Get own applications (job seeker)
export async function apiMyApplications() {
  return request("/applications", { method: "GET" });
}

// Get applications for employer's jobs (admin)
export async function apiEmployerApplications() {
  return request("/employer/applications", { method: "GET" });
}

// Update application status (admin)
export async function apiUpdateStatus(applicationId, status) {
  return request(`/applications/${applicationId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// Add internal notes to application (admin)
export async function apiUpdateNotes(applicationId, notes) {
  return request(`/applications/${applicationId}/notes`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });
}

// Withdraw application (job seeker)
export async function apiWithdrawApplication(applicationId) {
  return request(`/applications/${applicationId}`, { method: "DELETE" });
}

/* ======================
   USER PROFILE
   ====================== */

// Get current user profile from backend
export async function apiGetProfile() {
  return request("/users/me", { method: "GET" });
}

// Update profile fields
export async function apiUpdateProfile(body) {
  return request("/users/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// Upload resume (file)
export async function apiUploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);
  return uploadFile("/users/resume", formData);
}

// Upload avatar (file)
export async function apiUploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return uploadFile("/users/avatar", formData);
}

// Change password
export async function apiChangePassword(currentPassword, newPassword) {
  return request("/users/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
