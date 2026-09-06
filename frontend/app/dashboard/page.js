"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Stethoscope,
  Users,
  UserRound,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import api from "../../lib/api";

const monthName = (m) =>
  new Date(2000, m - 1, 1).toLocaleString("en", { month: "short" });

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((r) => setData(r.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Failed to load dashboard"),
      );
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="page-loading">Loading dashboard...</div>;

  const monthly = data.monthly.map((x) => ({
    name: `${monthName(x._id.month)} ${x._id.year}`,
    patients: x.patients,
  }));
  const doctors = data.patientsPerDoctor.map((x) => ({
    name: x.doctor,
    patients: x.patients,
  }));

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p>Monitor your doctor and patient records at a glance.</p>
        </div>
      </div>

      <div className="stats-grid">
        <Stat
          icon={<Stethoscope />}
          label="Total Doctors"
          value={data.totalDoctors}
        />
        <Stat
          icon={<Users />}
          label="Total Patients"
          value={data.totalPatients}
        />
        <Stat
          icon={<UserRound />}
          label="Patients / Doctor"
          value={
            data.totalDoctors
              ? (data.totalPatients / data.totalDoctors).toFixed(1)
              : "0"
          }
        />
        <Stat
          icon={<TrendingUp />}
          label="Latest Month"
          value={monthly.at(-1)?.patients || 0}
        />
      </div>

      <div className="charts-grid">
        <ChartCard
          title="Patients per Doctor"
          subtitle="Current patient distribution"
        >
          {doctors.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={doctors}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="patients" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
        <ChartCard
          title="Patient Growth"
          subtitle="Monthly patient registrations"
        >
          {monthly.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="patients"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Common Conditions"
        subtitle="Top recorded patient conditions"
      >
        <div className="condition-list">
          {data.conditionBreakdown.map((x, i) => (
            <div className="condition-row" key={x.condition}>
              <span>
                <i>{i + 1}</i>
                {x.condition}
              </span>
              <b>{x.count}</b>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function ChartCard({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function EmptyChart() {
  return <div className="empty-chart">No data available yet.</div>;
}
