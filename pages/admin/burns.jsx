// pages/admin/burns.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminBurnsPage() {
  const router = useRouter();
  const [burns, setBurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ amount: "", txHash: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [totalBurned, setTotalBurned] = useState("0");

  useEffect(() => {
    checkAuth();
    loadBurns();
    loadTotalBurned();
  }, []);

  async function loadTotalBurned() {
    try {
      const r = await fetch(`${API_BASE}/api/burns/total`);
      if (r.ok) {
        const d = await r.json();
        setTotalBurned(d.total || "0");
      }
    } catch (e) {
      console.error("Failed to load total burned:", e);
    }
  }

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

  async function loadBurns() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API_BASE}/api/admin/burns`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to load burns");
      const d = await r.json();
      setBurns(d.items || []);
    } catch (e) {
      setError(e.message || "Failed to load burns");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBurn() {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const r = await fetch(`${API_BASE}/api/admin/burns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: formData.amount,
          txHash: formData.txHash || null,
          note: formData.note || null,
        }),
      });

      const result = await r.json();
      if (!r.ok) {
        throw new Error(result.error || "Failed to add burn");
      }

      // Reset form and reload
      setFormData({ amount: "", txHash: "", note: "" });
      setShowAddForm(false);
      await loadBurns();
      await loadTotalBurned();
    } catch (e) {
      setError(e.message || "Failed to add burn");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString();
  }

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Burn Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #C9A227";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
            style={btnAdd}
          >
            {showAddForm ? "✕ Cancel" : "+ Add Burn"}
          </button>
        </div>

        {/* Total Burned Card */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total NOP Burned</div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#C9A227",
              fontFamily: "monospace",
            }}
          >
            {parseFloat((totalBurned || "0").replace(/,/g, "") || "0").toLocaleString()}
          </div>
        </div>

        {error && (
          <div style={{ padding: 12, background: "#FFE5E5", color: "#FF0000", borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {showAddForm && (
          <div style={card} className="card">
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Add New Burn</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
                  Amount (NOP) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid #C9A227";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
                  Transaction Hash (optional)
                </label>
                <input
                  type="text"
                  value={formData.txHash}
                  onChange={(e) => setFormData({ ...formData, txHash: e.target.value })}
                  placeholder="0x..."
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid #C9A227";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
                  Note (optional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Add a note about this burn"
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid #C9A227";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                />
              </div>
              <button
                onClick={handleAddBurn}
                disabled={submitting}
                onFocus={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.outline = "2px solid #C9A227";
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
                style={btnSubmit}
              >
                {submitting ? "Adding..." : "Add Burn"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading burns...</div>
        ) : burns.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>No burns recorded yet</div>
        ) : (
          <div style={card}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Burn History</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Tx Hash</th>
                    <th style={thStyle}>Note</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {burns.map((burn) => (
                    <tr key={burn.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={tdStyle}>#{burn.id}</td>
                      <td style={tdStyle}>
                        <strong style={{ color: "#C9A227" }}>
                          {parseFloat(burn.amount).toLocaleString()} NOP
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        {burn.txHash ? (
                          <a
                            href={`https://etherscan.io/tx/${burn.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0040FF", fontSize: 12 }}
                          >
                            {burn.txHash.slice(0, 10)}...
                          </a>
                        ) : (
                          <span style={{ color: "#999" }}>-</span>
                        )}
                      </td>
                      <td style={tdStyle}>{burn.note || <span style={{ color: "#999" }}>-</span>}</td>
                      <td style={tdStyle}>{formatDate(burn.createdAt)}</td>
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
  marginBottom: 16,
};

const btnAdd = {
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  transition: "all 0.2s",
  outline: "none",
};

const btnSubmit = {
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  opacity: 1,
  transition: "all 0.2s",
  outline: "none",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
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

