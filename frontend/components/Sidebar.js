"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  LogOut,
  Activity,
} from "lucide-react";
import { useAuth } from "../lib/auth";

export default function Sidebar() {
  const path = usePathname();
  const { logout } = useAuth();
  const links = [
    ["/dashboard", "Dashboard", LayoutDashboard],
    ["/dashboard/doctors", "Doctors", Stethoscope],
    ["/dashboard/patients", "Patients", Users],
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Activity size={21} />
        </div>
        <div>
          <b>Doctor Tracker</b>
          <small>Admin Portal</small>
        </div>
      </div>
      <nav>
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={
              path === href || path.startsWith(href + "/") ? "active" : ""
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <button className="logout-link" onClick={logout}>
        <LogOut size={18} /> Sign out
      </button>
    </aside>
  );
}
