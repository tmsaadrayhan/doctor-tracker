"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "../../../../lib/api";

export default function DoctorDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null),
    [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    condition: "",
    phone: "",
  });

  const load = () =>
    api
      .get(`/doctors/${id}`)
      .then((r) => setData(r.data))
      .catch(() => setData({ error: true }));
  useEffect(() => {
    if (id) load();
  }, [id]);

  async function add(e) {
    e.preventDefault();
    try {
      await api.post(`/doctors/${id}/patients`, form);
      setShow(false);
      setForm({ name: "", age: "", gender: "Male", condition: "", phone: "" });
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Failed");
    }
  }
  async function remove(pid) {
    if (!confirm("Delete this patient?")) return;
    await api.delete(`/patients/${pid}`);
    load();
  }

  if (!data) return <div className="page-loading">Loading doctor...</div>;
  if (data.error) return <div className="alert error">Doctor not found.</div>;

  return (
    <div className="page">
      <Link href="/dashboard/doctors" className="back-link">
        <ArrowLeft size={17} /> Back to doctors
      </Link>
      <div className="detail-hero panel">
        <div className="large-avatar">{data.doctor.name.charAt(0)}</div>
        <div>
          <p className="eyebrow">DOCTOR PROFILE</p>
          <h1>{data.doctor.name}</h1>
          <p>
            {data.doctor.specialization} · {data.doctor.hospital}
          </p>
          <div className="detail-meta">
            <span>{data.doctor.email}</span>
            <span>{data.doctor.phone}</span>
          </div>
        </div>
      </div>
      <div className="page-title page-title-row">
        <div>
          <h2>Patients</h2>
          <p>Patients assigned to {data.doctor.name}.</p>
        </div>
        <button className="btn primary" onClick={() => setShow(true)}>
          <Plus size={18} /> Add Patient
        </button>
      </div>
      <section className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Condition</th>
              <th>Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.patients.length ? (
              data.patients.map((p) => (
                <tr key={p._id}>
                  <td>
                    <b>{p.name}</b>
                  </td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>
                    <span className="badge">{p.condition}</span>
                  </td>
                  <td>{p.phone}</td>
                  <td>
                    <button
                      className="icon-btn danger"
                      onClick={() => remove(p._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="table-empty">
                  No patients assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {show && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h2>Add Patient</h2>
              <button className="icon-btn" onClick={() => setShow(false)}>
                ×
              </button>
            </div>
            <form onSubmit={add} className="form-grid">
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>
                <button className="btn primary">Add patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
