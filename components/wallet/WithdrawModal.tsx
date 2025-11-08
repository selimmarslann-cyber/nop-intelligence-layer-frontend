// Withdraw modal - backend'den onaylandıktan sonra soğuk cüzdandan kullanıcıya transfer
"use client";

import { useState } from "react";
import { API_URL } from "../../src/lib/api";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string | null;
  balance: string;
  onSuccess?: () => void;
}

export default function WithdrawModal({ isOpen, onClose, userAddress, balance, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleWithdraw() {
    if (!userAddress) {
      setError("Cüzdan bağlı değil");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Geçerli bir miktar girin");
      return;
    }

    const balanceNum = parseFloat(balance.replace(/,/g, "") || "0");
    if (parseFloat(amount) > balanceNum) {
      setError("Yetersiz bakiye");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
        const res = await fetch(`${API_URL}/api/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: userAddress,
          amount: parseFloat(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Withdraw başarısız");
      }

      setSuccess(`Withdraw talebi oluşturuldu (#${data.withdrawalId}). Admin onayı bekleniyor.`);
      setAmount("");
      onSuccess?.();
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setError(err.message || "Withdraw başarısız");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          maxWidth: 480,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E2328" }}>Withdraw NOP</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#666",
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 13 }}>
          <div style={{ color: "#666", marginBottom: 4 }}>Mevcut Bakiye (Puan)</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1E2328" }}>
            {parseFloat(balance.replace(/,/g, "") || "0").toLocaleString()} NOP
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#1E2328" }}>
            Miktar (NOP Puan)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="0.0"
            disabled={loading}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #C9A227";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={() => {
              const max = parseFloat(balance.replace(/,/g, "") || "0");
              setAmount(max.toString());
            }}
            style={{
              marginTop: 8,
              padding: "4px 12px",
              background: "#F8FAFC",
              border: "1px solid #E5E7EB",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
              color: "#666",
            }}
          >
            Max
          </button>
        </div>

        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#FFF3CD",
            borderRadius: 8,
            fontSize: 12,
            color: "#856404",
          }}
        >
          <strong>Not:</strong> Withdraw talebi admin onayından sonra ana hesaptan (soğuk cüzdan) zkSync Era ağında token olarak
          gönderilecektir. İşlem geri alınamaz.
        </div>
        
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#E5F7FF",
            borderRadius: 8,
            fontSize: 12,
            color: "#004085",
          }}
        >
          <strong>ℹ️ Bilgi:</strong> Withdraw talebi oluşturulduktan sonra bakiyenizden düşülür ve admin onayı beklenir. 
          Admin onayladığında tokenler otomatik olarak cüzdanınıza gönderilir.
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              background: "#FFE5E5",
              color: "#FF0000",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              background: "#E5F7E5",
              color: "#00AA00",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {success}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleWithdraw}
            disabled={loading || !amount}
            style={{
              flex: 1,
              background: loading || !amount ? "#ccc" : "#C9A227",
              color: "#1E2328",
              border: "none",
              padding: "12px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !amount ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            {loading ? "İşlem yapılıyor..." : "Withdraw Talebi Oluştur"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              background: "#F8FAFC",
              color: "#1E2328",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}

