"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Eye, EyeOff } from "lucide-react";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, setSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("1. Login submitted");
    console.log("2. Form:", form);

    try {
      console.log("3. Sending login request...");

      const { data } = await api.post("/auth/login", form);

      console.log("4. Login response:", data);

      if (data.requiresVerification) {
        console.log("5. Verification required");

        localStorage.setItem("verificationEmail", data.user.email);
        router.replace("/verify-email");
        return;
      }

      console.log("6. Setting session");

      setSession(data.token, data.user);

      console.log("7. Going to dashboard");

      router.replace("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      console.error("Response:", err.response?.data);

      setError(err.response?.data?.message || "Unable to sign in.");
    } finally {
      console.log("8. Login finished");
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="brand-mark">
          <Activity size={24} />
        </div>
        <div>
          <b>Doctor Tracker</b>
          <span>Administration Portal</span>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>Sign in to manage doctors and patients.</p>
        </div>
        <form onSubmit={submit} className="form-stack">
          <label>
            Email
            <input
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Password
            <div className="password-input">
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="btn primary full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
