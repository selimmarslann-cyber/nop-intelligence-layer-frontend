// pages/admin/contributions.jsx
// Admin Contributions management page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminContributions() {
  const router = useRouter();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedContribution, setSelectedContribution] = useState(null);

  useEffect(() => {
    checkAuth();
    loadContributions();
  }, [page]);

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

  async function loadContributions() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      const r = await fetch(`${API_BASE}/api/admin/contributions?${params}`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setContributions(data.items || []);
      }
    } catch (e) {
      console.error("Failed to load contributions:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this contribution?")) return;

    try {
      const r = await fetch(`${API_BASE}/api/admin/contributions/${id}/delete`, {
        method: "POST",
        credentials: "include",
      });

      if (r.ok) {
        loadContributions();
        alert("Contribution deleted");
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      alert("Failed to delete");
    }
  }

  async function handleUpdateScore(id) {
    const newScore = prompt("Enter new score:");
    if (!newScore || isNaN(parseInt(newScore))) return;

    try {
      const r = await fetch(`${API_BASE}/api/admin/contributions/${id}/update-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ score: parseInt(newScore) }),
      });

      if (r.ok) {
        loadContributions();
        alert("Score updated");
      } else {
        alert("Failed to update score");
      }
    } catch (e) {
      alert("Failed to update score");
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 700, color: "#1E2328" }}>
          Contributions
        </h1>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
            Loading contributions...
          </div>
        ) : (
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(201, 162, 39, 0.1)", borderBottom: "2px solid #E5E7EB" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Content</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Created</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid #E5E7EB",
                      background: idx % 2 === 0 ? "#fff" : "#F8FAFC",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(201, 162, 39, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#F8FAFC";
                    }}
                  >
                    <td style={tdStyle}>#{c.id}</td>
                    <td style={tdStyle}>
                      <code style={{ fontSize: 12, color: "#0040FF" }}>
                        {c.userAddress?.slice(0, 10)}...
                      </code>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{ cursor: "pointer", color: "#0040FF" }}
                        onClick={() => setSelectedContribution(c)}
                      >
                        {c.content}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: "#C9A227" }}>{c.score}</strong>
                    </td>
                    <td style={tdStyle}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleUpdateScore(c.id)}
                          style={actionButtonStyle}
                        >
                          Edit Score
                        </button>
                        <button onClick={() => handleDelete(c.id)} style={deleteButtonStyle}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Contribution Detail Modal */}
        {selectedContribution && (
          <ContributionDetailModal
            contribution={selectedContribution}
            onClose={() => setSelectedContribution(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function ContributionDetailModal({ contribution, onClose }) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 700,
          maxHeight: "80vh",
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: 24,
          zIndex: 9999,
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E2328" }}>
            Contribution Details
          </h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DetailRow label="ID" value={`#${contribution.id}`} />
          <DetailRow label="User" value={contribution.userAddress} />
          <DetailRow label="Score" value={contribution.score.toString()} />
          <DetailRow label="Created" value={new Date(contribution.createdAt).toLocaleString()} />
          <div>
            <div style={{ fontSize: 13, color: "#666", fontWeight: 600, marginBottom: 8 }}>
              Full Content:
            </div>
            <div
              style={{
                padding: 12,
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {contribution.fullContent || contribution.content}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  color: "#1E2328",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: 13,
  color: "#1E2328",
};

const actionButtonStyle = {
  padding: "4px 12px",
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "4px 12px",
  background: "#FF0000",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const closeButtonStyle = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: "none",
  background: "transparent",
  color: "#1E2328",
  fontSize: 20,
  cursor: "pointer",
};

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
      <span style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>{label}:</span>
      <span style={{ fontSize: 13, color: "#1E2328" }}>{value}</span>
    </div>
  );
}

