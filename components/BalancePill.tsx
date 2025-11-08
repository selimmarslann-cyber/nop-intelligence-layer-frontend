// components/BalancePill.tsx
// NOP balance pill with auto-refresh (30s) and manual refresh
import { useEffect, useState, useCallback } from "react";
import { API_URL } from "../src/lib/api";
import { useWallet } from "../contexts/WalletContext";

export default function BalancePill() {
  const { address, isConnected } = useWallet();
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refreshHover, setRefreshHover] = useState(false);

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance("0");
      return;
    }
    setLoading(true);
    setError(false);
    try {
        const r = await fetch(`${API_URL}/api/users/${address}/summary`);
      if (!r.ok) throw new Error("Failed to fetch balance");
      const data = await r.json();
      setBalance(data.balance || "0");
    } catch (e) {
      setError(true);
      console.error("Balance fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Initial load and auto-refresh every 30s
  useEffect(() => {
    if (!address) return;
    
    fetchBalance(); // Initial load
    
    const interval = setInterval(() => {
      fetchBalance();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [address, fetchBalance]);

  // Don't render if no wallet connected
  if (!isConnected || !address) return null;

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchBalance();
  };

  return (
    <div style={pillStyle}>
      <span style={labelStyle}>NOP</span>
      <span style={balanceStyle}>
        {loading ? "…" : error ? "—" : formatBalance(balance)}
      </span>
      <button
        onClick={handleRefresh}
        disabled={loading}
        onMouseEnter={() => setRefreshHover(true)}
        onMouseLeave={() => setRefreshHover(false)}
        onFocus={(e) => {
          e.currentTarget.style.outline = "2px solid #C9A227";
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
        style={{
          ...refreshButtonStyle,
          background: refreshHover ? "rgba(30, 35, 40, 0.25)" : "rgba(30, 35, 40, 0.15)",
        }}
        title="Refresh balance"
        aria-label="Refresh balance"
      >
        ↻
      </button>
    </div>
  );
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// Gold-anthracite styling with tokens
const pillStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 20,
  background: "linear-gradient(135deg, #C9A227 0%, #B8921F 100%)", // Primary gold
  color: "#1E2328", // Neutral anthracite
  border: "1px solid rgba(30, 35, 40, 0.2)",
  boxShadow: "0 2px 8px rgba(201, 162, 39, 0.3)",
  fontSize: 13,
  fontWeight: 600,
  height: 32,
  cursor: "default",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  letterSpacing: 0.5,
  color: "#1E2328",
};

const balanceStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#1E2328",
  minWidth: "40px",
  textAlign: "right",
};

const refreshButtonStyle: React.CSSProperties = {
  background: "rgba(30, 35, 40, 0.15)",
  border: "none",
  borderRadius: "50%",
  width: 20,
  height: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  fontSize: 12,
  color: "#1E2328",
  transition: "background 0.2s",
  outline: "none",
};

