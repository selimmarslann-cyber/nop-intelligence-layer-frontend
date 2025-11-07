// pages/admin/users.jsx
// Admin Users management page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    checkAuth();
    loadUsers();
  }, [page, search]);

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

  async function loadUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(search && { search }),
      });
      const r = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setUsers(data.items || []);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjustNOP(userId, amount, reason = "") {
    if (!confirm(`Adjust NOP by ${amount}?`)) return;

    try {
      const r = await fetch(`${API_BASE}/api/admin/users/${userId}/adjust-nop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount, reason }),
      });

      if (r.ok) {
        loadUsers();
        alert("NOP adjusted successfully");
      } else {
        const data = await r.json();
        alert(data.error || "Failed to adjust NOP");
      }
    } catch (e) {
      alert("Failed to adjust NOP");
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#1E2328" }}>Users</h1>
          <input
            type="text"
            placeholder="Search by address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 14,
              width: 300,
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading users...</div>
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
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>NOP Points</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Joined</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
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
                    <td style={tdStyle}>#{user.id}</td>
                    <td style={tdStyle}>
                      <code style={{ fontSize: 12, color: "#0040FF" }}>{user.address}</code>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: "#C9A227" }}>
                        {parseFloat(user.balance).toLocaleString()}
                      </strong>
                    </td>
                    <td style={tdStyle}>{user.score}</td>
                    <td style={tdStyle}>{new Date(user.joinedAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            const amount = prompt("Enter NOP amount to add (negative to subtract):");
                            if (amount) {
                              handleAdjustNOP(user.id, amount);
                            }
                          }}
                          style={actionButtonStyle}
                        >
                          ± NOP
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          style={actionButtonStyle}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ padding: 16, display: "flex", justifyContent: "center", gap: 8 }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={paginationButtonStyle}
                >
                  ← Prev
                </button>
                <span style={{ padding: "8px 16px", color: "#666" }}>
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  style={paginationButtonStyle}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </div>
    </AdminLayout>
  );
}

function UserDetailModal({ user, onClose }) {
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
          maxWidth: 600,
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: 24,
          zIndex: 9999,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E2328" }}>
            User Details
          </h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DetailRow label="ID" value={`#${user.id}`} />
          <DetailRow label="Address" value={user.address} />
          <DetailRow label="NOP Points" value={parseFloat(user.balance).toLocaleString()} />
          <DetailRow label="Score" value={user.score.toString()} />
          <DetailRow label="Joined" value={new Date(user.joinedAt).toLocaleString()} />
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
      <span style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>{label}:</span>
      <span style={{ fontSize: 13, color: "#1E2328" }}>{value}</span>
    </div>
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

const paginationButtonStyle = {
  padding: "8px 16px",
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
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

