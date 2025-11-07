// pages/wallet.jsx
import { useEffect, useState } from "react";
import WalletHeader from "../components/wallet/WalletHeader";
import BalanceCards from "../components/wallet/BalanceCards";
import StakePanel from "../components/wallet/StakePanel";
import DepositModal from "../components/wallet/DepositModal";
import WithdrawModal from "../components/wallet/WithdrawModal";
import { useWallet } from "../contexts/WalletContext";
import { getApiBase } from "../src/lib/api";

const API_BASE = getApiBase();

export default function WalletPage() {
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({
    balance: "0",
    staked: "0",
    rewards: "0",
    tier: "Tier 0",
    cooldownEndsAt: null,
  });

  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Withdrawal history
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);

  // Kullanıcı verilerini yükle
  async function load() {
    if (!address) return;
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API_BASE}/api/users/${address}/summary`);
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      setData(d);
    } catch (e) {
      setErr("Wallet bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  // Withdrawal history yükle
  async function loadWithdrawals() {
    if (!address) return;
    setWithdrawalsLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/users/${address}/withdrawals`);
      if (!r.ok) throw new Error("Failed to load withdrawals");
      const d = await r.json();
      setWithdrawals(d.items || []);
    } catch (e) {
      console.error("Failed to load withdrawals:", e);
    } finally {
      setWithdrawalsLoading(false);
    }
  }

  useEffect(() => {
    if (address) {
      load();
      loadWithdrawals();
    }
  }, [address]);

  const handleRefresh = () => {
    if (address) {
      load();
      loadWithdrawals();
    }
  };

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

  return (
    <div style={{ background: "#fff", minHeight: "100vh", color: "#111" }}>
      <WalletHeader address={address} onRefresh={() => { load(); loadWithdrawals(); }} />

      <div style={{ maxWidth: 1200, margin: "24px auto", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* SOL SÜTUN */}
          <div style={{ display: "grid", gap: 16 }}>
            <BalanceCards
              loading={loading}
              balance={data.balance}
              staked={data.staked}
              rewards={data.rewards}
              onClaimClick={() => {}}
            />

            <StakePanel address={address || ""} onChanged={load} />
          </div>

          {/* SAĞ SÜTUN – Deposit & Withdraw Buttons */}
          <div style={card}>
            <h3 style={h3}>Token İşlemleri</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <button
                onClick={() => setShowDepositModal(true)}
                disabled={!isConnected || !address}
                onFocus={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.outline = "2px solid #C9A227";
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
                style={{
                  ...btnPrimary,
                  width: "100%",
                  opacity: !isConnected || !address ? 0.6 : 1,
                  cursor: !isConnected || !address ? "not-allowed" : "pointer",
                }}
              >
                💰 Deposit NOP
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={!isConnected || !address}
                onFocus={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.outline = "2px solid #C9A227";
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
                style={{
                  ...btnPrimary,
                  width: "100%",
                  background: "#1E2328",
                  color: "#F8FAFC",
                  opacity: !isConnected || !address ? 0.6 : 1,
                  cursor: !isConnected || !address ? "not-allowed" : "pointer",
                }}
              >
                💸 Withdraw NOP
              </button>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 12, color: "#666" }}>
              <div style={{ marginBottom: 4 }}>
                <strong>Ağ:</strong> zkSync Era
              </div>
              <div>
                <strong>Token:</strong> NOP (0x941F...748E)
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal History Table */}
        <div style={card}>
          <h3 style={h3}>Withdrawal History</h3>
          {withdrawalsLoading ? (
            <div style={{ padding: 20, textAlign: "center", color: "#666" }}>Loading...</div>
          ) : withdrawals.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#666" }}>No withdrawal requests yet</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Fee</th>
                    <th style={thStyle}>Net Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Tx Hash</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={tdStyle}>#{w.id}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        userAddress={address}
        onSuccess={handleRefresh}
      />
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        userAddress={address}
        balance={data.balance}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

const card = {
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: 16,
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};

const h3 = { margin: 0, fontSize: 18, marginBottom: 12, color: "#1E2328" };

const btnPrimary = {
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
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
