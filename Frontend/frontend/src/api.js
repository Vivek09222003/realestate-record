const BASE_URL = "http://localhost:8080/api";

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

function buildQuery(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
}

export async function getProjects(filters = {}) {
  const query = buildQuery(filters);
  const res = await fetch(`${BASE_URL}/projects${query ? `?${query}` : ""}`);
  return handleResponse(res);
}

export async function getDevelopers() {
  const res = await fetch(`${BASE_URL}/projects/developers`);
  return handleResponse(res);
}

export async function getCommunities() {
  const res = await fetch(`${BASE_URL}/projects/communities`);
  return handleResponse(res);
}

export async function createProject(data) {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateProject(id, data) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteProject(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function getProperties(filters = {}) {
  const query = buildQuery(filters);
  const res = await fetch(`${BASE_URL}/properties${query ? `?${query}` : ""}`);
  return handleResponse(res);
}

export async function createProperty(data) {
  const res = await fetch(`${BASE_URL}/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateProperty(id, data) {
  const res = await fetch(`${BASE_URL}/properties/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteProperty(id) {
  const res = await fetch(`${BASE_URL}/properties/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function importProjectsFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/import/projects`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(res);
}

export async function importPropertiesFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/import/properties`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(res);
}