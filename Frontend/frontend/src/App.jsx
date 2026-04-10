import { useEffect, useMemo, useState } from "react";
import {
  getProjects,
  getDevelopers,
  getCommunities,
  createProject,
  updateProject,
  deleteProject,
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  importProjectsFile,
  importPropertiesFile,
} from "./api";
import "./index.css";

const emptyProject = {
  projectName: "",
  communityName: "",
  developerName: "",
  uploadDate: "",
  detailsLink: "",
  imageLink: "",
};

const emptyProperty = {
  projectId: "",
  propertyName: "",
  propertyType: "",
  uploadDate: "",
  detailsLink: "",
  imageLink: "",
};

export default function App() {
  const [projects, setProjects] = useState([]);
  const [properties, setProperties] = useState([]);

  const [developers, setDevelopers] = useState([]);
  const [communities, setCommunities] = useState([]);

  const [projectForm, setProjectForm] = useState(emptyProject);
  const [propertyForm, setPropertyForm] = useState(emptyProperty);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingPropertyId, setEditingPropertyId] = useState(null);

  const [projectImportFile, setProjectImportFile] = useState(null);
  const [propertyImportFile, setPropertyImportFile] = useState(null);

  const [projectFilters, setProjectFilters] = useState({
    keyword: "",
    developer: "",
    community: "",
    fromDate: "",
    toDate: "",
  });

  const [propertyFilters, setPropertyFilters] = useState({
    keyword: "",
    projectId: "",
    fromDate: "",
    toDate: "",
  });

  const [message, setMessage] = useState("");

  const loadProjects = async (filters = projectFilters) => {
    const data = await getProjects(filters);
    setProjects(data);
  };

  const loadProperties = async (filters = propertyFilters) => {
    const data = await getProperties(filters);
    setProperties(data);
  };

  const loadLookups = async () => {
    const [developerData, communityData] = await Promise.all([
      getDevelopers(),
      getCommunities(),
    ]);
    setDevelopers(developerData);
    setCommunities(communityData);
  };

  const loadData = async () => {
    try {
      const [projectData, propertyData, developerData, communityData] =
        await Promise.all([
          getProjects(projectFilters),
          getProperties(propertyFilters),
          getDevelopers(),
          getCommunities(),
        ]);

      setProjects(projectData);
      setProperties(propertyData);
      setDevelopers(developerData);
      setCommunities(communityData);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const developerSet = new Set(
      projects.map((p) => p.developerName).filter(Boolean)
    );
    const communitySet = new Set(
      projects.map((p) => p.communityName).filter(Boolean)
    );

    return {
      totalProjects: projects.length,
      totalProperties: properties.length,
      developers: developerSet.size,
      communities: communitySet.size,
    };
  }, [projects, properties]);

  const handleProjectChange = (e) => {
    setProjectForm({
      ...projectForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePropertyChange = (e) => {
    setPropertyForm({
      ...propertyForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleProjectFilterChange = (e) => {
    setProjectFilters({
      ...projectFilters,
      [e.target.name]: e.target.value,
    });
  };

  const handlePropertyFilterChange = (e) => {
    setPropertyFilters({
      ...propertyFilters,
      [e.target.name]: e.target.value,
    });
  };

  const submitProject = async (e) => {
    e.preventDefault();

    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, projectForm);
        setMessage("Project updated successfully");
      } else {
        await createProject(projectForm);
        setMessage("Project added successfully");
      }

      setProjectForm(emptyProject);
      setEditingProjectId(null);
      await loadProjects(projectFilters);
      await loadLookups();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitProperty = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...propertyForm,
        projectId: Number(propertyForm.projectId),
      };

      if (editingPropertyId) {
        await updateProperty(editingPropertyId, payload);
        setMessage("Property updated successfully");
      } else {
        await createProperty(payload);
        setMessage("Property added successfully");
      }

      setPropertyForm(emptyProperty);
      setEditingPropertyId(null);
      await loadProperties(propertyFilters);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setProjectForm({
      projectName: project.projectName || "",
      communityName: project.communityName || "",
      developerName: project.developerName || "",
      uploadDate: project.uploadDate || "",
      detailsLink: project.detailsLink || "",
      imageLink: project.imageLink || "",
    });
    setMessage("Editing project");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditProperty = (property) => {
    setEditingPropertyId(property.id);
    setPropertyForm({
      projectId: property.project?.id ? String(property.project.id) : "",
      propertyName: property.propertyName || "",
      propertyType: property.propertyType || "",
      uploadDate: property.uploadDate || "",
      detailsLink: property.detailsLink || "",
      imageLink: property.imageLink || "",
    });
    setMessage("Editing property");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProject = async (id) => {
    const confirmed = window.confirm(
      "Delete this project? All related properties will also be deleted."
    );
    if (!confirmed) return;

    try {
      await deleteProject(id);

      if (editingProjectId === id) {
        setEditingProjectId(null);
        setProjectForm(emptyProject);
      }

      setMessage("Project deleted successfully");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDeleteProperty = async (id) => {
    const confirmed = window.confirm("Delete this property?");
    if (!confirmed) return;

    try {
      await deleteProperty(id);

      if (editingPropertyId === id) {
        setEditingPropertyId(null);
        setPropertyForm(emptyProperty);
      }

      setMessage("Property deleted successfully");
      await loadProperties(propertyFilters);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const cancelProjectEdit = () => {
    setEditingProjectId(null);
    setProjectForm(emptyProject);
    setMessage("Project edit cancelled");
  };

  const cancelPropertyEdit = () => {
    setEditingPropertyId(null);
    setPropertyForm(emptyProperty);
    setMessage("Property edit cancelled");
  };

  const searchProjects = async () => {
    try {
      await loadProjects(projectFilters);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const searchProperties = async () => {
    try {
      await loadProperties(propertyFilters);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const resetProjectSearch = async () => {
    const empty = {
      keyword: "",
      developer: "",
      community: "",
      fromDate: "",
      toDate: "",
    };

    try {
      setProjectFilters(empty);
      await loadProjects(empty);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const resetPropertySearch = async () => {
    const empty = {
      keyword: "",
      projectId: "",
      fromDate: "",
      toDate: "",
    };

    try {
      setPropertyFilters(empty);
      await loadProperties(empty);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleImportProjects = async () => {
    if (!projectImportFile) {
      setMessage("Please choose a projects Excel file");
      return;
    }

    try {
      const result = await importProjectsFile(projectImportFile);
      setMessage(
        `Projects import complete. Success: ${result.successCount}, Failed: ${result.failedCount}`
      );
      setProjectImportFile(null);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleImportProperties = async () => {
    if (!propertyImportFile) {
      setMessage("Please choose a properties Excel file");
      return;
    }

    try {
      const result = await importPropertiesFile(propertyImportFile);
      setMessage(
        `Properties import complete. Success: ${result.successCount}, Failed: ${result.failedCount}`
      );
      setPropertyImportFile(null);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">Range Record</div>
          <div className="brand-subtitle">Dubai Real Estate Tracker</div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            Dashboard
          </a>
          <a href="#projects" className="nav-item">
            Projects
          </a>
          <a href="#properties" className="nav-item">
            Properties
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="mini-label">Workspace</div>
          <div className="mini-value">Internal Listing Team</div>
        </div>
      </aside>

      <main className="main-content">
        <section className="hero-card" id="dashboard">
          <div>
            <span className="hero-badge">Professional Admin Panel</span>
            <h1>Real Estate Work Dashboard</h1>
            <p className="page-subtitle">
              Manage project records, property records, image links, details
              links, upload dates, and bulk Excel imports.
            </p>
          </div>
        </section>

        {message && <div className="alert">{message}</div>}

        <section className="panel glass-panel">
          <div className="panel-header">
            <h2>Bulk Import from Excel</h2>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Import Projects (.xlsx)</label>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) =>
                  setProjectImportFile(e.target.files?.[0] || null)
                }
              />
              <button
                className="btn btn-gradient"
                type="button"
                onClick={handleImportProjects}
              >
                Upload Projects File
              </button>
            </div>

            <div className="field">
              <label>Import Properties (.xlsx)</label>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) =>
                  setPropertyImportFile(e.target.files?.[0] || null)
                }
              />
              <button
                className="btn btn-gradient"
                type="button"
                onClick={handleImportProperties}
              >
                Upload Properties File
              </button>
            </div>
          </div>

          <div style={{ marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>
            Projects columns: projectName, communityName, developerName,
            uploadDate, detailsLink, imageLink
            <br />
            Properties columns: projectName, propertyName, propertyType,
            uploadDate, detailsLink, imageLink
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card card-purple">
            <span className="stat-label">Total Projects</span>
            <span className="stat-value">{stats.totalProjects}</span>
          </div>
          <div className="stat-card card-pink">
            <span className="stat-label">Total Properties</span>
            <span className="stat-value">{stats.totalProperties}</span>
          </div>
          <div className="stat-card card-blue">
            <span className="stat-label">Developers</span>
            <span className="stat-value">{stats.developers}</span>
          </div>
          <div className="stat-card card-orange">
            <span className="stat-label">Communities</span>
            <span className="stat-value">{stats.communities}</span>
          </div>
        </section>

        <section className="form-grid">
          <div className="panel glass-panel">
            <div className="panel-header">
              <h2>{editingProjectId ? "Edit Project" : "Add Project"}</h2>
              {editingProjectId && <span className="pill">Editing</span>}
            </div>

            <form onSubmit={submitProject} className="form-layout">
              <div className="field">
                <label>Project Name</label>
                <input
                  name="projectName"
                  value={projectForm.projectName}
                  onChange={handleProjectChange}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="field">
                <label>Community Name</label>
                <input
                  name="communityName"
                  value={projectForm.communityName}
                  onChange={handleProjectChange}
                  placeholder="Enter community name"
                />
              </div>

              <div className="field">
                <label>Developer Name</label>
                <input
                  name="developerName"
                  value={projectForm.developerName}
                  onChange={handleProjectChange}
                  placeholder="Enter developer name"
                />
              </div>

              <div className="field">
                <label>Upload Date</label>
                <input
                  name="uploadDate"
                  type="date"
                  value={projectForm.uploadDate}
                  onChange={handleProjectChange}
                />
              </div>

              <div className="field field-full">
                <label>Details Link</label>
                <input
                  name="detailsLink"
                  value={projectForm.detailsLink}
                  onChange={handleProjectChange}
                  placeholder="Paste details source link"
                />
              </div>

              <div className="field field-full">
                <label>Image Link</label>
                <input
                  name="imageLink"
                  value={projectForm.imageLink}
                  onChange={handleProjectChange}
                  placeholder="Paste image source link"
                />
              </div>

              <div className="button-row">
                <button className="btn btn-gradient" type="submit">
                  {editingProjectId ? "Update Project" : "Save Project"}
                </button>
                {editingProjectId && (
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={cancelProjectEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="panel glass-panel">
            <div className="panel-header">
              <h2>{editingPropertyId ? "Edit Property" : "Add Property"}</h2>
              {editingPropertyId && <span className="pill">Editing</span>}
            </div>

            <form onSubmit={submitProperty} className="form-layout">
              <div className="field">
                <label>Select Project</label>
                <select
                  name="projectId"
                  value={propertyForm.projectId}
                  onChange={handlePropertyChange}
                  required
                >
                  <option value="">Choose a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Property Name</label>
                <input
                  name="propertyName"
                  value={propertyForm.propertyName}
                  onChange={handlePropertyChange}
                  placeholder="Enter property name"
                  required
                />
              </div>

              <div className="field">
                <label>Property Type</label>
                <select
                  name="propertyType"
                  value={propertyForm.propertyType}
                  onChange={handlePropertyChange}
                >
                  <option value="">Choose property type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>

              <div className="field">
                <label>Upload Date</label>
                <input
                  name="uploadDate"
                  type="date"
                  value={propertyForm.uploadDate}
                  onChange={handlePropertyChange}
                />
              </div>

              <div className="field field-full">
                <label>Details Link</label>
                <input
                  name="detailsLink"
                  value={propertyForm.detailsLink}
                  onChange={handlePropertyChange}
                  placeholder="Paste property details link"
                />
              </div>

              <div className="field field-full">
                <label>Image Link</label>
                <input
                  name="imageLink"
                  value={propertyForm.imageLink}
                  onChange={handlePropertyChange}
                  placeholder="Paste property image link"
                />
              </div>

              <div className="button-row">
                <button className="btn btn-gradient" type="submit">
                  {editingPropertyId ? "Update Property" : "Save Property"}
                </button>
                {editingPropertyId && (
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={cancelPropertyEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="panel vibrant-panel" id="projects">
          <div className="panel-header">
            <h2>Projects</h2>
          </div>

          <div className="toolbar multi-toolbar">
            <input
              className="search-input"
              name="keyword"
              placeholder="Search by project, community, developer"
              value={projectFilters.keyword}
              onChange={handleProjectFilterChange}
            />

            <select
              name="developer"
              value={projectFilters.developer}
              onChange={handleProjectFilterChange}
            >
              <option value="">All Developers</option>
              {developers.map((developer) => (
                <option key={developer} value={developer}>
                  {developer}
                </option>
              ))}
            </select>

            <select
              name="community"
              value={projectFilters.community}
              onChange={handleProjectFilterChange}
            >
              <option value="">All Communities</option>
              {communities.map((community) => (
                <option key={community} value={community}>
                  {community}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="fromDate"
              value={projectFilters.fromDate}
              onChange={handleProjectFilterChange}
            />

            <input
              type="date"
              name="toDate"
              value={projectFilters.toDate}
              onChange={handleProjectFilterChange}
            />

            <button
              className="btn btn-gradient"
              type="button"
              onClick={searchProjects}
            >
              Apply Filters
            </button>

            <button
              className="btn btn-light"
              type="button"
              onClick={resetProjectSearch}
            >
              Reset
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project</th>
                  <th>Community</th>
                  <th>Developer</th>
                  <th>Upload Date</th>
                  <th>Details</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.id}</td>
                      <td>{project.projectName}</td>
                      <td>{project.communityName || "-"}</td>
                      <td>{project.developerName || "-"}</td>
                      <td>{project.uploadDate || "-"}</td>
                      <td>
                        {project.detailsLink ? (
                          <a
                            href={project.detailsLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {project.imageLink ? (
                          <a
                            href={project.imageLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <div className="action-row">
                          <button
                            className="btn btn-small btn-outline"
                            type="button"
                            onClick={() => handleEditProject(project)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            type="button"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel vibrant-panel" id="properties">
          <div className="panel-header">
            <h2>Properties</h2>
          </div>

          <div className="toolbar multi-toolbar">
            <input
              className="search-input"
              name="keyword"
              placeholder="Search by property, type, project"
              value={propertyFilters.keyword}
              onChange={handlePropertyFilterChange}
            />

            <select
              name="projectId"
              value={propertyFilters.projectId}
              onChange={handlePropertyFilterChange}
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectName}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="fromDate"
              value={propertyFilters.fromDate}
              onChange={handlePropertyFilterChange}
            />

            <input
              type="date"
              name="toDate"
              value={propertyFilters.toDate}
              onChange={handlePropertyFilterChange}
            />

            <button
              className="btn btn-gradient"
              type="button"
              onClick={searchProperties}
            >
              Apply Filters
            </button>

            <button
              className="btn btn-light"
              type="button"
              onClick={resetPropertySearch}
            >
              Reset
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project</th>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Upload Date</th>
                  <th>Details</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No properties found
                    </td>
                  </tr>
                ) : (
                  properties.map((property) => (
                    <tr key={property.id}>
                      <td>{property.id}</td>
                      <td>{property.project?.projectName || "-"}</td>
                      <td>{property.propertyName}</td>
                      <td>{property.propertyType || "-"}</td>
                      <td>{property.uploadDate || "-"}</td>
                      <td>
                        {property.detailsLink ? (
                          <a
                            href={property.detailsLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {property.imageLink ? (
                          <a
                            href={property.imageLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <div className="action-row">
                          <button
                            className="btn btn-small btn-outline"
                            type="button"
                            onClick={() => handleEditProperty(property)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            type="button"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}