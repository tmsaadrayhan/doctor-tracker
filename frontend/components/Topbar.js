"use client";

import { Bell } from "lucide-react";

const titles = {
  "/dashboard": "Dashboard",
  "/dashboard/doctors": "Doctors",
  "/dashboard/patients": "Patients",
};

export default function Topbar({ pathname, user }) {
  const title = pathname.includes("/doctors/")
    ? "Doctor Profile"
    : titles[pathname] || "Doctor Tracker";
  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        <p>Sunday, September 6, 2026</p>
      </div>
      <div className="topbar-user">
        <button className="icon-btn">
          <Bell size={18} />
        </button>
        <div className="mini-avatar">{user.name.charAt(0)}</div>
        <div>
          <b>{user.name}</b>
          <small>{user.email}</small>
        </div>
      </div>
    </header>
  );
}
