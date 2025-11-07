// pages/admin/login.jsx
// Admin login page
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const r = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: "include",
      });
      if (r.ok) {
        router.push("/admin");
      }
    } catch (e) {
      // Not logged in
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1E2328 0%, #2A2F35 100%)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: 32,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: "#1E2328",
              marginBottom: 8,
            }}
          >
            Admin Login
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
            NOP Intelligence Layer
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              background: "#FFE5E5",
              color: "#FF0000",
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#1E2328",
                marginBottom: 6,
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                background: "#fff",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#1E2328",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                background: "#fff",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#ccc" : "#C9A227",
              color: "#1E2328",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "#B8921F";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "#C9A227";
              }
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

