"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
      return;
    }

    const savedEmail = localStorage.getItem("verificationEmail");

    if (!savedEmail) {
      router.replace("/login");
      return;
    }

    setEmail(savedEmail);
  }, [user, router]);

  async function submit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/verify-email", {
        email,
        code,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("verificationEmail");

      router.replace("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!email) return;

    setError("");
    setMessage("");
    setResending(true);

    try {
      const { data } = await api.post("/auth/resend-verification", {
        email,
      });

      setMessage(
        data.message || "A new verification code has been sent to your email.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send a new verification code.",
      );
    } finally {
      setResending(false);
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
          <h1>Verify your email</h1>

          <p>
            Enter the 6-digit verification code sent to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={submit} className="form-stack">
          <label>
            Verification Code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              required
            />
          </label>

          {error && <div className="alert error">{error}</div>}

          {message && <div className="alert success">{message}</div>}

          <button type="submit" className="btn primary full" disabled={loading}>
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={resendCode}
              disabled={resending}
              className="auth-link-button"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </p>

          <p>
            Wrong email? <Link href="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
