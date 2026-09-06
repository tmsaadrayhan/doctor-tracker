"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import api from "../../../lib/api";

const blank = {
  name: "",
  age: "",
  gender: "Male",
  condition: "",
  phone: "",
  doctor: "",
};

export default function PatientsPage() {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 }),
    [options, setOptions] = useState({ conditions: [], doctors: [] });
  const [filters, setFilters] = useState({
    search: "",
    condition: "",
    doctor: "",
    gender: "",
    from: "",
    to: "",
  });
  const [form, setForm] = useState(blank),
    [editing, setEditing] = useState(null),
    [modal, setModal] = useState(false),
    [filterOpen, setFilterOpen] = useState(false),
    [loading, setLoading] = useState(true);

  async function load(page = 1) {
    setLoading(true);
    try {
      const r = await api.get("/patients", {
        params: { ...filters, page, limit: 8 },
      });
      setItems(r.data.items);
      setMeta(r.data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    api.get("/patients/options").then((r) => setOptions(r.data));
  }, []);
  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
  }, [
    filters.search,
    filters.condition,
    filters.doctor,
    filters.gender,
    filters.from,
    filters.to,
  ]);

  function create() {
    setEditing(null);
    setForm(blank);
    setModal(true);
  }
  function edit(p) {
    setEditing(p._id);
    setForm({
      name: p.name,
      age: p.age,
      gender: p.gender,
      condition: p.condition,
      phone: p.phone,
      doctor: p.doctor?._id || "",
    });
    setModal(true);
  }
  async function save(e) {
    e.preventDefault();
    try {
      if (editing) await api.put(`/patients/${editing}`, form);
      else await api.post("/patients", form);
      setModal(false);
      await load(meta.page);
      const o = await api.get("/patients/options");
      setOptions(o.data);
    } catch (e) {
      alert(e.response?.data?.message || "Unable to save patient");
    }
  }
  async function remove(id) {
    if (!confirm("Delete this patient?")) return;
    await api.delete(`/patients/${id}`);
    load(meta.page);
  }

  return (
    <div className="page">
      <div className="page-title page-title-row">
        <div>
          <p className="eyebrow">MANAGEMENT</p>
          <h1>Patients</h1>
          <p>Search, filter, edit and manage every patient record.</p>
        </div>
        <button className="btn primary" onClick={create}>
          <Plus size={18} /> Add Patient
        </button>
      </div>
      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search patient or condition..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <button
            className={`btn ${filterOpen ? "active" : ""}`}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <SlidersHorizontal size={17} /> Filters
          </button>
        </div>
        {filterOpen && (
          <div>
            <div
              className="filter-grid"
              style={{ fontSize: "14px", fontWeight: "bold" }}
            >
              <div>
                <p className="">Select condition</p>
                <select
                  value={filters.condition}
                  onChange={(e) =>
                    setFilters({ ...filters, condition: e.target.value })
                  }
                >
                  <option value="">All conditions</option>
                  {options.conditions.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="">Select a doctor</p>
                <select
                  value={filters.doctor}
                  onChange={(e) =>
                    setFilters({ ...filters, doctor: e.target.value })
                  }
                >
                  <option value="">All doctors</option>
                  {options.doctors.map((x) => (
                    <option value={x._id} key={x._id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="">Select gender</p>
                <select
                  value={filters.gender}
                  onChange={(e) =>
                    setFilters({ ...filters, gender: e.target.value })
                  }
                >
                  <option value="">All genders</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <p className="">Select date from</p>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters({ ...filters, from: e.target.value })
                  }
                />
              </div>
              <div>
                <p className="">Select date to</p>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters({ ...filters, to: e.target.value })
                  }
                />
              </div>
            </div>
            <button
              className="btn"
              onClick={() =>
                setFilters({
                  search: "",
                  condition: "",
                  doctor: "",
                  gender: "",
                  from: "",
                  to: "",
                })
              }
            >
              <X size={16} /> Clear filters
            </button>
          </div>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Condition</th>
                <th>Doctor</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="person-cell">
                        <div className="avatar patient">{p.name.charAt(0)}</div>
                        <div>
                          <b>{p.name}</b>
                          <small>
                            Added {new Date(p.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.age} · {p.gender}
                    </td>
                    <td>
                      <span className="badge">{p.condition}</span>
                    </td>
                    <td>{p.doctor?.name || "—"}</td>
                    <td>{p.phone}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => edit(p)}>
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => remove(p._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onChange={load} />
      </section>
      {modal && (
        <Modal
          title={editing ? "Edit Patient" : "Add Patient"}
          close={() => setModal(false)}
        >
          <form onSubmit={save} className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Age
              <input
                type="number"
                min="0"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
              />
            </label>
            <label>
              Gender
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Condition
              <input
                value={form.condition}
                onChange={(e) =>
                  setForm({ ...form, condition: e.target.value })
                }
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </label>
            <label>
              Doctor
              <select
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                required
              >
                <option value="">Select doctor</option>
                {options.doctors.map((d) => (
                  <option value={d._id} key={d._id}>
                    {d.name} — {d.specialization}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="btn primary">
                {editing ? "Save changes" : "Add patient"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
function Pagination({ meta, onChange }) {
  return (
    <div className="pagination">
      <span>{meta.total || 0} patients</span>
      <div>
        <button
          className="btn small"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
        >
          Previous
        </button>
        <span>
          Page {meta.page} of {meta.pages}
        </span>
        <button
          className="btn small"
          disabled={meta.page >= meta.pages}
          onClick={() => onChange(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
function Modal({ title, close, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={close}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
