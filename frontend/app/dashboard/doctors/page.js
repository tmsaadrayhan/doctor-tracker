"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import api from "../../../lib/api";

const empty = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

export default function DoctorsPage() {
  const [items, setItems] = useState([]),
    [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 }),
    [options, setOptions] = useState({ specializations: [], hospitals: [] });
  const [filters, setFilters] = useState({
    search: "",
    specialization: "",
    hospital: "",
    from: "",
    to: "",
  });
  const [form, setForm] = useState(empty),
    [editing, setEditing] = useState(null),
    [modal, setModal] = useState(false),
    [filterOpen, setFilterOpen] = useState(false),
    [loading, setLoading] = useState(true);

  async function load(page = 1) {
    setLoading(true);
    try {
      const r = await api.get("/doctors", {
        params: { ...filters, page, limit: 8 },
      });
      setItems(r.data.items);
      setMeta(r.data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    api.get("/doctors/options").then((r) => setOptions(r.data));
  }, []);
  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
  }, [
    filters.search,
    filters.specialization,
    filters.hospital,
    filters.from,
    filters.to,
  ]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setModal(true);
  }
  function openEdit(d) {
    setEditing(d._id);
    setForm({
      name: d.name,
      specialization: d.specialization,
      hospital: d.hospital,
      phone: d.phone,
      email: d.email,
    });
    setModal(true);
  }
  async function save(e) {
    e.preventDefault();
    try {
      if (editing) await api.put(`/doctors/${editing}`, form);
      else await api.post("/doctors", form);
      setModal(false);
      setForm(empty);
      await load(meta.page);
      const o = await api.get("/doctors/options");
      setOptions(o.data);
    } catch (e) {
      alert(e.response?.data?.message || "Unable to save doctor");
    }
  }
  async function remove(id) {
    if (!confirm("Delete this doctor and all associated patients?")) return;
    try {
      await api.delete(`/doctors/${id}`);
      await load(meta.page);
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div className="page">
      <div className="page-title page-title-row">
        <div>
          <p className="eyebrow">MANAGEMENT</p>
          <h1>Doctors</h1>
          <p>Manage your doctors and their patient relationships.</p>
        </div>
        <button className="btn primary" onClick={openCreate}>
          <Plus size={18} /> Add Doctor
        </button>
      </div>
      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search by name, specialty or hospital..."
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
              style={{ fontSize: "14px", fontWeight: "bold" }}
              className="filter-grid"
            >
              <div>
                <p>Select specialization</p>
                <select
                  value={filters.specialization}
                  onChange={(e) =>
                    setFilters({ ...filters, specialization: e.target.value })
                  }
                >
                  <option value="">All specializations</option>
                  {options.specializations.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div>
                <p>Select hospital</p>
                <select
                  value={filters.hospital}
                  onChange={(e) =>
                    setFilters({ ...filters, hospital: e.target.value })
                  }
                >
                  <option value="">All hospitals</option>
                  {options.hospitals.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div>
                <p>Select date from</p>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters({ ...filters, from: e.target.value })
                  }
                />
              </div>
              <div>
                <p>Select date to</p>
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
                  specialization: "",
                  hospital: "",
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
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Hospital</th>
                <th>Phone</th>
                <th>Patients</th>
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
                items.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div className="person-cell">
                        <div className="avatar">{d.name.charAt(0)}</div>
                        <div>
                          <b>{d.name}</b>
                          <small>{d.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{d.specialization}</td>
                    <td>{d.hospital}</td>
                    <td>{d.phone}</td>
                    <td>
                      <span className="badge">{d.patientCount}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link
                          href={`/dashboard/doctors/${d._id}`}
                          className="icon-btn"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          className="icon-btn"
                          onClick={() => openEdit(d)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => remove(d._id)}
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
                    No doctors found.
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
          title={editing ? "Edit Doctor" : "Add Doctor"}
          close={() => setModal(false)}
        >
          <form onSubmit={save} className="form-grid">
            {Object.entries({
              name: "Name",
              specialization: "Specialization",
              hospital: "Hospital",
              phone: "Phone",
              email: "Email",
            }).map(([k, l]) => (
              <label key={k}>
                {l}
                <input
                  type={k === "email" ? "email" : "text"}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  required
                />
              </label>
            ))}
            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="btn primary">
                {editing ? "Save changes" : "Create doctor"}
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
      <span>{meta.total || 0} doctors</span>
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
