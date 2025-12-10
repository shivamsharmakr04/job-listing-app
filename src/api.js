// src/api.js

const API_BASE = "http://localhost:5000/api"; // adjust if your backend URL is different

function getToken() {
  try {
    return localStorage.getItem("jb_token");
  } catch {
    return null;
  }
}

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
    // ignore
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed with ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/* =========================
   AUTH
   ========================= */

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

/* =========================
   JOBS
   ========================= */

export async function apiGetJobs() {
  return request("/jobs", {
    method: "GET",
  });
}

export async function apiCreateJob(job) {
  return request("/jobs", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

export async function apiDeleteJob(jobId) {
  return request(`/jobs/${jobId}`, {
    method: "DELETE",
  });
}

/* =========================
   APPLICATIONS
   ========================= */

// job seeker applies to a job
export async function apiApplyJob(jobId) {
  // If your backend expects different body/URL, adjust accordingly
  return request(`/jobs/${jobId}/apply`, {
    method: "POST",
    body: JSON.stringify({ jobId }),
  });
}

// applications of currently logged-in job seeker
export async function apiMyApplications() {
  return request("/applications/my", {
    method: "GET",
  });
}

// applications for employer / admin (for all their posted jobs)
export async function apiEmployerApplications() {
  return request("/applications/employer", {
    method: "GET",
  });
}

// update status of one application
export async function apiUpdateStatus(applicationId, status) {
  return request(`/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
// src/api.js

// ...your existing request(), apiCreateJob, apiGetJobs etc.

// UPDATE an existing job (admin)
export async function apiUpdateJob(jobId, body) {
  return request(`/jobs/${jobId}`, {
    method: "PUT",          // or "PATCH" if your backend uses PATCH
    body: JSON.stringify(body),
  });
}


