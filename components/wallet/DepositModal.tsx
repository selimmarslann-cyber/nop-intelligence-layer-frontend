// Deposit modal for transferring NOP tokens from user wallet to cold wallet
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { NOP_TOKEN_CONTRACT, COLD_WALLET_ADDRESS, ZKSYNC_ERA, ERC20_ABI } from "../../src/lib/contracts";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string | null;
  onSuccess?: () => void;
}

export default function DepositModal({ isOpen, onClose, userAddress, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && userAddress) {
      checkNetwork();
      loadTokenBalance();
    }
  }, [isOpen, userAddress]);

  async function checkNetwork() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setIsCorrectNetwork(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // zkSync Era chain ID is 324
      if (chainId === 324) {
        setIsCorrectNetwork(true);
      } else {
        setIsCorrectNetwork(false);
      }
    } catch (err) {
      console.error("Network check error:", err);
      setIsCorrectNetwork(false);
    }
  }

  async function switchToZkSync() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("MetaMask bulunamadı");
      return;
    }

    try {
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [ZKSYNC_ERA],
      });
      await checkNetwork();
    } catch (err: any) {
      console.error("Network switch error:", err);
      setError(err.message || "Ağ değiştirilemedi");
    }
  }

  async function loadTokenBalance() {
    if (!userAddress || typeof window === "undefined" || !(window as any).ethereum) {
      return;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const tokenContract = new ethers.Contract(NOP_TOKEN_CONTRACT, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(userAddress);
      const decimals = await tokenContract.decimals();
      const formatted = ethers.formatUnits(balance, decimals);
      setTokenBalance(formatted);
    } catch (err) {
      console.error("Balance load error:", err);
      setTokenBalance(null);
    }
  }

  async function handleDeposit() {
    if (!userAddress) {
      setError("Cüzdan bağlı değil");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Geçerli bir miktar girin");
      return;
    }

    if (isCorrectNetwork === false) {
      setError("Lütfen zkSync Era ağına geçin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask bulunamadı");
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(NOP_TOKEN_CONTRACT, ERC20_ABI, signer);

      // Get token decimals
      const decimals = await tokenContract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);

      // Check balance
      const balance = await tokenContract.balanceOf(userAddress);
      if (balance < amountWei) {
        throw new Error("Yetersiz bakiye. Cüzdanınızda yeterli NOP token bulunmuyor.");
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Deposit işlemini onaylıyor musunuz?\n\n` +
        `Gönderen: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}\n` +
        `Alıcı: ${COLD_WALLET_ADDRESS.slice(0, 6)}...${COLD_WALLET_ADDRESS.slice(-4)}\n` +
        `Miktar: ${amount} NOP\n\n` +
        `Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`
      );

      if (!confirmed) {
        setLoading(false);
        return;
      }

      // Transfer to cold wallet
      setError("MetaMask'te işlemi onaylayın...");
      const tx = await tokenContract.transfer(COLD_WALLET_ADDRESS, amountWei);
      
      setError("İşlem gönderildi, onay bekleniyor...");
      
      // Wait for transaction
      const receipt = await tx.wait();

      // Notify backend about deposit
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
        const depositRes = await fetch(`${apiBase}/api/deposit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: userAddress,
            amount: amount,
            txHash: receipt.hash,
          }),
        });
        
        if (!depositRes.ok) {
          const errorData = await depositRes.json().catch(() => ({}));
          console.warn("Backend deposit notification failed:", errorData);
          // Show warning but don't fail - transaction is already on blockchain
          alert(`⚠️ Deposit başarılı ancak backend bildirimi başarısız oldu. Lütfen admin ile iletişime geçin.\n\nTx Hash: ${receipt.hash}`);
        } else {
          const depositData = await depositRes.json();
          if (depositData.ok) {
            // Success - balance updated
            console.log("Deposit recorded successfully:", depositData);
          }
        }
      } catch (backendErr) {
        console.error("Backend notification failed:", backendErr);
        // Show warning but don't fail - transaction is already on blockchain
        alert(`⚠️ Deposit başarılı ancak backend bildirimi başarısız oldu. Lütfen admin ile iletişime geçin.\n\nTx Hash: ${receipt.hash}`);
      }

      setAmount("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Deposit error:", err);
      setError(err.message || "Deposit başarısız");
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
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E2328" }}>Deposit NOP</h2>
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

        {isCorrectNetwork === false && (
          <div
            style={{
              padding: 12,
              background: "#FFF3CD",
              border: "1px solid #FFC107",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>⚠️ Yanlış Ağ</div>
            <div style={{ marginBottom: 8 }}>Lütfen zkSync Era ağına geçin.</div>
            <button
              onClick={switchToZkSync}
              style={{
                background: "#C9A227",
                color: "#1E2328",
                border: "none",
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              zkSync Era'ya Geç
            </button>
          </div>
        )}

        {tokenBalance !== null && (
          <div style={{ marginBottom: 16, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 13 }}>
            <div style={{ color: "#666", marginBottom: 4 }}>Cüzdan Bakiyesi</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1E2328" }}>
              {parseFloat(tokenBalance).toLocaleString()} NOP
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#1E2328" }}>
            Miktar (NOP)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
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
          {tokenBalance && (
            <button
              onClick={() => setAmount(tokenBalance)}
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
          )}
        </div>

        <div style={{ marginBottom: 16, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 12, color: "#666" }}>
          <div style={{ marginBottom: 4 }}>
            <strong>Alıcı (Ana Hesap):</strong> {COLD_WALLET_ADDRESS.slice(0, 10)}...{COLD_WALLET_ADDRESS.slice(-8)}
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong>Ağ:</strong> zkSync Era
          </div>
          <div style={{ marginTop: 8, padding: 8, background: "#FFF3CD", borderRadius: 6, fontSize: 11, color: "#856404" }}>
            ⚠️ <strong>Uyarı:</strong> Bu işlem geri alınamaz. Sadece güvendiğiniz adrese gönderin.
          </div>
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

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDeposit}
            disabled={loading || !amount || isCorrectNetwork === false}
            style={{
              flex: 1,
              background: loading || !amount || isCorrectNetwork === false ? "#ccc" : "#C9A227",
              color: "#1E2328",
              border: "none",
              padding: "12px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !amount || isCorrectNetwork === false ? "not-allowed" : "pointer",
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
            {loading ? "İşlem yapılıyor..." : "Deposit"}
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

