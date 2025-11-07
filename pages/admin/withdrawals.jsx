// pages/admin/withdrawals.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [processingId, setProcessingId] = useState(null);

  // Load withdrawals
  async function loadWithdrawals() {
    setLoading(true);
    setError("");
    try {
      const url = statusFilter === "all" 
        ? `${API_BASE}/api/admin/withdrawals`
        : `${API_BASE}/api/admin/withdrawals?status=${statusFilter}`;
      
      const r = await fetch(url, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to load withdrawals");
      const d = await r.json();
      setWithdrawals(d.items || []);
    } catch (e) {
      setError(e.message || "Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
    loadWithdrawals();
  }, [statusFilter]);

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

  // Approve withdrawal
  async function handleApprove(id, txHash = null) {
    if (processingId) return;
    setProcessingId(id);
    try {
      const r = await fetch(`${API_BASE}/api/admin/withdrawals/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ txHash }),
      });

      const result = await r.json();
      if (!r.ok) {
        throw new Error(result.error || "Failed to approve");
      }

      // Refresh list
      await loadWithdrawals();
    } catch (e) {
      alert(e.message || "Failed to approve withdrawal");
    } finally {
      setProcessingId(null);
    }
  }

  // Reject withdrawal
  async function handleReject(id) {
    if (processingId || !confirm("Are you sure you want to reject this withdrawal? The balance will be refunded.")) {
      return;
    }

    setProcessingId(id);
    try {
      const r = await fetch(`${API_BASE}/api/admin/withdrawals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await r.json();
      if (!r.ok) {
        throw new Error(result.error || "Failed to reject");
      }

      // Refresh list
      await loadWithdrawals();
    } catch (e) {
      alert(e.message || "Failed to reject withdrawal");
    } finally {
      setProcessingId(null);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString();
  }

  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "processing":
        return "#0040FF";
      case "done":
        return "#00AA00";
      case "failed":
        return "#FF0000";
      default:
        return "#666";
    }
  }

  function shortenAddress(addr) {
    if (!addr) return "-";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Withdrawals Admin</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              style={{
                padding: "8px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="done">Done</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={loadWithdrawals}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              style={btnRefresh}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: 12, background: "#FFE5E5", color: "#FF0000", borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
            No withdrawals found with status: {statusFilter}
          </div>
        ) : (
          <div style={card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Address</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Fee</th>
                    <th style={thStyle}>Net Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Tx Hash</th>
                    <th style={thStyle}>Created</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={tdStyle}>#{w.id}</td>
                      <td style={tdStyle}>
                        <code style={{ fontSize: 12, color: "#0040FF" }}>{shortenAddress(w.address)}</code>
                      </td>
                      <td style={tdStyle}>{parseFloat(w.amount).toLocaleString()}</td>
                      <td style={tdStyle}>{parseFloat(w.fee).toLocaleString()}</td>
                      <td style={tdStyle}>
                        <strong>{parseFloat(w.netAmount).toLocaleString()}</strong>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: getStatusColor(w.status) + "20",
                            color: getStatusColor(w.status),
                          }}
                        >
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {w.txHash ? (
                          <a
                            href={`https://explorer.zksync.io/tx/${w.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0040FF", fontSize: 12 }}
                          >
                            {w.txHash.slice(0, 10)}...
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={tdStyle}>{formatDate(w.createdAt)}</td>
                      <td style={tdStyle}>
                        {w.status === "pending" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => {
                                const txHash = prompt("Enter transaction hash (optional):");
                                if (txHash !== null) {
                                  handleApprove(w.id, txHash || null);
                                }
                              }}
                              disabled={processingId === w.id}
                              onFocus={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.outline = "2px solid #00AA00";
                                  e.currentTarget.style.outlineOffset = "2px";
                                }
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.outline = "none";
                              }}
                              style={{
                                ...btnApprove,
                                opacity: processingId === w.id ? 0.6 : 1,
                              }}
                            >
                              {processingId === w.id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(w.id)}
                              disabled={processingId === w.id}
                              onFocus={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.outline = "2px solid #FF0000";
                                  e.currentTarget.style.outlineOffset = "2px";
                                }
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.outline = "none";
                              }}
                              style={{
                                ...btnReject,
                                opacity: processingId === w.id ? 0.6 : 1,
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {w.status !== "pending" && <span style={{ color: "#999", fontSize: 12 }}>-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const card = {
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: 16,
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};

const btnRefresh = {
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  transition: "all 0.2s",
  outline: "none",
};

const btnApprove = {
  background: "#00AA00",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  transition: "all 0.2s",
  outline: "none",
};

const btnReject = {
  background: "#FF0000",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  transition: "all 0.2s",
  outline: "none",
};

const thStyle = {
  padding: "12px 8px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const tdStyle = {
  padding: "12px 8px",
  fontSize: 13,
  color: "#111",
};

