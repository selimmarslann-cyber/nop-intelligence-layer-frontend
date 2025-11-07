// components/BoostedEvents.jsx
// Boost Event - Task completion system
"use client";
import { useEffect, useState } from "react";
import { getApiBase } from "../src/lib/api";
import { useWallet } from "../contexts/WalletContext";

const TASKS = [
  {
    id: "contribution",
    icon: "✓",
    label: "Make a helpful contribution",
    reward: 500,
    rewardLabel: "+ 500",
  },
  {
    id: "refer",
    icon: "👥",
    label: "Refer someone",
    reward: 5000,
    rewardLabel: "+ 5 000\nNOP",
  },
  {
    id: "deposit",
    icon: "🔒",
    label: "Deposit and send NOP to your account",
    reward: 5000,
    rewardLabel: "+ 5 000\nNOP",
  },
];

export default function BoostedEvents() {
  const { address, isConnected } = useWallet();
  const [taskStatus, setTaskStatus] = useState({});
  const [allCompleted, setAllCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadTaskStatus();
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadTaskStatus, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  async function loadTaskStatus() {
    try {
      const r = await fetch(`${getApiBase()}/api/boost-tasks/status?address=${address}`);
      if (r.ok) {
        const data = await r.json();
        setTaskStatus(data.tasks || {});
        setAllCompleted(data.allCompleted || false);
      }
    } catch (e) {
      console.error("Failed to load task status:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteTasks() {
    if (!allCompleted || claiming) return;

    setClaiming(true);
    try {
      const r = await fetch(`${getApiBase()}/api/boost-tasks/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (r.ok) {
        const data = await r.json();
        alert(`Tebrikler! ${data.totalReward || 0} NOP puanı hesabınıza yatırıldı.`);
        // Refresh task status
        await loadTaskStatus();
      } else {
        const errorData = await r.json().catch(() => ({}));
        alert(errorData.error || "Ödül alınamadı. Lütfen tekrar deneyin.");
      }
    } catch (e) {
      console.error("Failed to claim rewards:", e);
      alert("Ödül alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setClaiming(false);
    }
  }

  const cardStyle = {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 24 }}>🎉</span>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: "#1E2328",
          }}
        >
          BOOST EVENT
        </h2>
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
        {TASKS.map((task, index) => {
          const isCompleted = taskStatus[task.id] === true;
          return (
            <div
              key={task.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: index < TASKS.length - 1 ? "1px solid #E5E7EB" : "none",
              }}
            >
              {/* Left: Icon + Label */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCompleted ? "#1E2328" : "#E5E7EB",
                    color: isCompleted ? "#fff" : "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? "✓" : task.icon}
                </div>
                <span
                  style={{
                    fontSize: 14,
                    color: "#1E2328",
                    fontWeight: isCompleted ? 600 : 400,
                  }}
                >
                  {task.label}
                </span>
              </div>

              {/* Right: Reward */}
              <div
                style={{
                  fontSize: 14,
                  color: "#1E2328",
                  fontWeight: 400,
                  textAlign: "right",
                  whiteSpace: "pre-line",
                }}
              >
                {task.rewardLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Tasks Button */}
      <button
        onClick={handleCompleteTasks}
        disabled={!allCompleted || claiming}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: allCompleted && !claiming ? "#C9A227" : "#E5E7EB",
          color: allCompleted && !claiming ? "#1E2328" : "#999",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: allCompleted && !claiming ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (allCompleted && !claiming) {
            e.currentTarget.style.background = "#B8921F";
          }
        }}
        onMouseLeave={(e) => {
          if (allCompleted && !claiming) {
            e.currentTarget.style.background = "#C9A227";
          }
        }}
        onFocus={(e) => {
          if (allCompleted && !claiming) {
            e.currentTarget.style.outline = "2px solid #C9A227";
            e.currentTarget.style.outlineOffset = "2px";
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
      >
        {claiming ? "Ödül Alınıyor..." : allCompleted ? "Complete Tasks & Claim Rewards" : "Complete Tasks"}
      </button>
    </div>
  );
}

