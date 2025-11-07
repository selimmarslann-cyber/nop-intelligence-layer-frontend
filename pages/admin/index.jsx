// pages/admin/index.jsx
// Admin dashboard main page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  async function checkAuth() {
    try {
      const r = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: "include",
      });
      if (!r.ok) {
        router.push("/admin/login");
        return;
      }
      setLoading(false);
    } catch (e) {
      router.push("/admin/login");
    }
  }

  async function loadStats() {
    try {
      const r = await fetch(`${API_BASE}/api/admin/stats`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to load stats:", e);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1E2328",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 700, color: "#1E2328" }}>
          Dashboard
        </h1>

        {/* Stats Cards */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} />
            <StatCard label="Total Contributions" value={stats.totalContributions.toLocaleString()} />
            <StatCard label="Total NOP" value={parseFloat(stats.totalNOP).toLocaleString()} />
            <StatCard label="Total Burned" value={parseFloat(stats.totalBurned).toLocaleString()} />
            <StatCard label="Active Events" value={stats.activeEvents.toString()} />
          </div>
        )}

        {/* Quick Actions */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: 24,
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600, color: "#1E2328" }}>
            Quick Actions
          </h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <QuickActionButton
              label="View Users"
              onClick={() => router.push("/admin/users")}
            />
            <QuickActionButton
              label="View Contributions"
              onClick={() => router.push("/admin/contributions")}
            />
            <QuickActionButton
              label="Manage Withdraws"
              onClick={() => router.push("/admin/withdraws")}
            />
            <QuickActionButton
              label="Boosted Events"
              onClick={() => router.push("/admin/events")}
            />
            <QuickActionButton
              label="Burn Counter"
              onClick={() => router.push("/admin/burns")}
            />
            <QuickActionButton
              label="System Health"
              onClick={() => router.push("/admin/health")}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: 20,
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#1E2328" }}>{value}</div>
    </div>
  );
}

function QuickActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: "#C9A227",
        color: "#1E2328",
        border: "none",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        outline: "none",
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = "2px solid #C9A227";
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#B8921F";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#C9A227";
      }}
    >
      {label}
    </button>
  );
}

