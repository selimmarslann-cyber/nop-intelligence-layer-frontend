// pages/admin/health.jsx
// Admin System Health & AI Monitor page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminHealth() {
  const router = useRouter();
  const [aiHealth, setAiHealth] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadHealth();
    // Reduced frequency to avoid rate limits (5 minutes, matches backend cache)
    const interval = setInterval(loadHealth, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  async function checkAuth() {
    try {
      const r = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: "include",
      });
      if (!r.ok) {
        router.push("/admin/login");
      }
    } catch (e) {
      router.push("/admin/login");
    }
  }

  async function loadHealth() {
    try {
      // Check AI health
      const aiR = await fetch(`${API_BASE}/api/ai/health`, {
        credentials: "include",
      });
      if (aiR.ok) {
        const aiData = await aiR.json();
        setAiHealth(aiData);
      }

      // Check backend health
      const backendR = await fetch(`${API_BASE}/health`, {
        credentials: "include",
      });
      if (backendR.ok) {
        const backendData = await backendR.json();
        setSystemInfo({
          backend: backendData.status === "ok" ? "Healthy" : "Unhealthy",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error("Failed to load health:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#1E2328" }}>
            System Health & AI Monitor
          </h1>
          <button onClick={loadHealth} style={primaryButtonStyle}>
            ↻ Refresh
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {/* AI Health Card */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600, color: "#1E2328" }}>
              AI Health (OpenRouter)
            </h2>
            {loading ? (
              <div style={{ color: "#666" }}>Checking...</div>
            ) : aiHealth ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <StatusRow
                  label="Status"
                  value={aiHealth.status}
                  isGood={aiHealth.status === "healthy"}
                />
                <StatusRow label="Model" value={aiHealth.model || "N/A"} />
                <StatusRow
                  label="Response"
                  value={aiHealth.responseReceived ? "✓ Received" : "✗ No response"}
                  isGood={aiHealth.responseReceived}
                />
                {aiHealth.error && (
                  <div style={{ padding: 8, background: "#FFE5E5", borderRadius: 4, fontSize: 12, color: "#FF0000" }}>
                    Error: {aiHealth.error}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: "#FF0000" }}>Failed to check AI health</div>
            )}
          </div>

          {/* System Info Card */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600, color: "#1E2328" }}>
              System Info
            </h2>
            {systemInfo ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <StatusRow label="Backend" value={systemInfo.backend} isGood={systemInfo.backend === "Healthy"} />
                <StatusRow label="Last Check" value={new Date(systemInfo.timestamp).toLocaleString()} />
              </div>
            ) : (
              <div style={{ color: "#666" }}>Loading...</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusRow({ label, value, isGood }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#666" }}>{label}:</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: isGood ? "#00AA00" : isGood === false ? "#FF0000" : "#1E2328",
        }}
      >
        {value}
      </span>
    </div>
  );
}

const primaryButtonStyle = {
  padding: "10px 20px",
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

