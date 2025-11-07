// components/wallet/WalletConnectModal.tsx
// Wallet connection modal with MetaMask and Trust Wallet options
"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: string; // Why the modal was opened (e.g., "like", "comment")
}

export default function WalletConnectModal({
  isOpen,
  onClose,
  triggerReason,
}: WalletConnectModalProps) {
  const { connect } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<"metamask" | "trustwallet" | "coinbase" | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Check if providers are available
  const hasMetaMask = typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask;
  const hasTrustWallet =
    typeof window !== "undefined" &&
    (!!(window as any).ethereum?.isTrust ||
      !!(window as any).trustwallet ||
      !!(window as any).ethereum?.isTrustWallet);
  const hasCoinbase =
    typeof window !== "undefined" &&
    (!!(window as any).ethereum?.isCoinbaseWallet ||
      !!(window as any).coinbase);

  const hasAnyProvider = hasMetaMask || hasTrustWallet || hasCoinbase;

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTab);
    return () => modal.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Focus first button when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstButton = modalRef.current.querySelector("button");
      setTimeout(() => firstButton?.focus(), 100);
    }
  }, [isOpen]);

  const handleConnect = async (providerType: "metamask" | "trustwallet" | "coinbase" | "email") => {
    setError(null);
    setConnecting(providerType);

    try {
      if (providerType === "email") {
        if (!email || !email.includes("@")) {
          setError("Please enter a valid email address.");
          setConnecting(null);
          return;
        }
        await connect("email", email, referralCode.trim() || undefined);
      } else {
        await connect(providerType, undefined, referralCode.trim() || undefined);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setConnecting(null);
    }
  };

  const handleEmailClick = () => {
    setShowEmailInput(true);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
        pointerEvents: "none",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.5)",
          pointerEvents: "auto",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        style={{
          position: "relative",
          width: "90%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          zIndex: 9999,
          padding: 24,
          margin: 0,
          boxSizing: "border-box",
          pointerEvents: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            id="wallet-modal-title"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "#1E2328",
            }}
          >
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: "none",
              background: "transparent",
              color: "#1E2328",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #C9A227";
              e.currentTarget.style.outlineOffset = "2px";
              e.currentTarget.style.background = "rgba(201, 162, 39, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
              e.currentTarget.style.background = "transparent";
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201, 162, 39, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            ×
          </button>
        </div>

        {/* Message */}
        {triggerReason && (
          <p
            style={{
              margin: "0 0 20px 0",
              fontSize: 14,
              color: "#666",
              lineHeight: 1.5,
            }}
          >
            Please connect your wallet to {triggerReason}.
          </p>
        )}

        {/* Referral Code Input */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              color: "#1E2328",
            }}
          >
            Referans Kodu (Opsiyonel)
          </label>
          <input
            type="text"
            placeholder="Referans kodunu girin"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            disabled={connecting !== null}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.2s",
              textTransform: "uppercase",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#C9A227";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          />
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: 12,
              color: "#666",
            }}
          >
            Referans kodu ile kayıt olursanız bonus NOP kazanırsınız.
          </p>
        </div>

        {/* Provider buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* MetaMask - Always shown */}
          <button
            onClick={() => handleConnect("metamask")}
            disabled={connecting !== null}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: connecting === "metamask" ? "#B8921F" : "#C9A227",
              color: "#1E2328",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: connecting !== null ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: "0 2px 4px rgba(201, 162, 39, 0.2)",
            }}
            onFocus={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "#B8921F";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "#C9A227";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
              }
            }}
          >
            {connecting === "metamask" ? (
              <>⏳ Connecting...</>
            ) : (
              <>
                🦊 Connect with MetaMask
              </>
            )}
          </button>

          {/* Trust Wallet - Always shown */}
          <button
            onClick={() => handleConnect("trustwallet")}
            disabled={connecting !== null}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: connecting === "trustwallet" ? "#B8921F" : "#C9A227",
              color: "#1E2328",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: connecting !== null ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: "0 2px 4px rgba(201, 162, 39, 0.2)",
            }}
            onFocus={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "#B8921F";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "#C9A227";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
              }
            }}
          >
            {connecting === "trustwallet" ? (
              <>⏳ Connecting...</>
            ) : (
              <>
                🔒 Connect with Trust Wallet
              </>
            )}
          </button>

          {/* Coinbase Wallet - Always shown */}
          <button
            onClick={() => handleConnect("coinbase")}
            disabled={connecting !== null}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: connecting === "coinbase" ? "#B8921F" : "#C9A227",
              color: "#1E2328",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: connecting !== null ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: "0 2px 4px rgba(201, 162, 39, 0.2)",
            }}
            onFocus={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "#B8921F";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "#C9A227";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
              }
            }}
          >
            {connecting === "coinbase" ? (
              <>⏳ Connecting...</>
            ) : (
              <>
                🔵 Connect with Coinbase Wallet
              </>
            )}
          </button>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "#E5E7EB",
              margin: "8px 0",
            }}
          />

          {/* Email Connection */}
          {!showEmailInput ? (
            <button
              onClick={handleEmailClick}
              disabled={connecting !== null}
              style={{
                width: "100%",
                padding: "16px 20px",
                background: "#F8FAFC",
                color: "#1E2328",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: connecting !== null ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
              onFocus={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.outline = "2px solid #C9A227";
                  e.currentTarget.style.outlineOffset = "2px";
                  e.currentTarget.style.borderColor = "#C9A227";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
                e.currentTarget.style.borderColor = "#E5E7EB";
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = "#F0F4F8";
                  e.currentTarget.style.borderColor = "#C9A227";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = "#F8FAFC";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }
              }}
            >
              📧 Mail ile bağlan
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="email"
                placeholder="E-posta adresinizi girin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={connecting !== null}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C9A227";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email) {
                    handleConnect("email");
                  }
                }}
              />
              <button
                onClick={() => handleConnect("email")}
                disabled={connecting !== null || !email}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background: connecting === "email" || !email ? "#B8921F" : "#C9A227",
                  color: "#1E2328",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: connecting !== null || !email ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  outline: "none",
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
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.background = "#B8921F";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.background = "#C9A227";
                  }
                }}
              >
                {connecting === "email" ? "⏳ Bağlanıyor..." : "Bağlan"}
              </button>
            </div>
          )}
        </div>


        {/* Error message */}
        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#FFE5E5",
              color: "#FF0000",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

