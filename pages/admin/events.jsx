// pages/admin/events.jsx
// Admin Boosted Events management page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    xMultiplier: "1",
    startsAt: "",
    endsAt: "",
    active: true,
  });

  useEffect(() => {
    checkAuth();
    loadEvents();
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

  async function loadEvents() {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/events`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setEvents(data.items || []);
      }
    } catch (e) {
      console.error("Failed to load events:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const url = editingEvent
      ? `${API_BASE}/api/admin/events/${editingEvent.id}`
      : `${API_BASE}/api/admin/events`;
    const method = editingEvent ? "PUT" : "POST";

    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          xMultiplier: parseFloat(formData.xMultiplier),
          startsAt: formData.startsAt || null,
          endsAt: formData.endsAt || null,
          active: formData.active,
        }),
      });

      if (r.ok) {
        loadEvents();
        setShowForm(false);
        setEditingEvent(null);
        setFormData({ title: "", xMultiplier: "1", startsAt: "", endsAt: "", active: true });
        alert(editingEvent ? "Event updated" : "Event created");
      } else {
        const data = await r.json();
        alert(data.error || "Failed to save event");
      }
    } catch (e) {
      alert("Failed to save event");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const r = await fetch(`${API_BASE}/api/admin/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (r.ok) {
        loadEvents();
        alert("Event deleted");
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      alert("Failed to delete");
    }
  }

  function startEdit(event) {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      xMultiplier: event.xMultiplier.toString(),
      startsAt: event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : "",
      endsAt: event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : "",
      active: event.active !== false,
    });
    setShowForm(true);
  }

  function getStatus(event) {
    if (!event.endsAt) return "Active";
    const now = new Date();
    const end = new Date(event.endsAt);
    if (end < now) return "Expired";
    if (event.startsAt && new Date(event.startsAt) > now) return "Upcoming";
    return "Active";
  }

  return (
    <AdminLayout>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#1E2328" }}>
            Boosted Events
          </h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingEvent(null);
              setFormData({ title: "", xMultiplier: "1", startsAt: "", endsAt: "", active: true });
            }}
            style={primaryButtonStyle}
          >
            + Create Event
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600, color: "#1E2328" }}>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Multiplier *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={formData.xMultiplier}
                  onChange={(e) => setFormData({ ...formData, xMultiplier: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Start Date (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  End Date (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  id="active"
                />
                <label htmlFor="active" style={{ fontSize: 13, fontWeight: 600 }}>
                  Active
                </label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" disabled={submitting} style={primaryButtonStyle}>
                  {submitting ? "..." : editingEvent ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading events...</div>
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
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Multiplier</th>
                  <th style={thStyle}>Start</th>
                  <th style={thStyle}>End</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr
                    key={event.id}
                    style={{
                      borderBottom: "1px solid #E5E7EB",
                      background: idx % 2 === 0 ? "#fff" : "#F8FAFC",
                    }}
                  >
                    <td style={tdStyle}>{event.title}</td>
                    <td style={tdStyle}>
                      <strong style={{ color: "#C9A227" }}>{event.xMultiplier}x</strong>
                    </td>
                    <td style={tdStyle}>
                      {event.startsAt ? new Date(event.startsAt).toLocaleString() : "-"}
                    </td>
                    <td style={tdStyle}>
                      {event.endsAt ? new Date(event.endsAt).toLocaleString() : "-"}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={getStatus(event)} />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => startEdit(event)} style={actionButtonStyle}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(event.id)} style={deleteButtonStyle}>
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
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Active: { bg: "#00AA00", color: "#fff" },
    Expired: { bg: "#999", color: "#fff" },
    Upcoming: { bg: "#FFA500", color: "#fff" },
  };
  const style = colors[status] || colors.Active;
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg + "20",
        color: style.bg,
      }}
    >
      {status}
    </span>
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

const secondaryButtonStyle = {
  padding: "10px 20px",
  background: "transparent",
  color: "#666",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
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

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 14,
};

