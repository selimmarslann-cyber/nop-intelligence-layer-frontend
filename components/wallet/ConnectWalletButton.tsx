// components/wallet/ConnectWalletButton.tsx
// Top-right fixed Connect Wallet button with dropdown
"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "../../contexts/WalletContext";
import WalletConnectModal from "./WalletConnectModal";

export default function ConnectWalletButton() {
  const { address, isConnected, disconnect, copyAddress } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  };

  const handleCopy = async () => {
    await copyAddress();
    setShowDropdown(false);
    // You could show a toast notification here
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  if (isConnected && address) {
    return (
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            background: "#C9A227",
            color: "#1E2328",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            outline: "none",
            boxShadow: "0 2px 4px rgba(201, 162, 39, 0.2)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid #C9A227";
            e.currentTarget.style.outlineOffset = "2px";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#B8921F";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#C9A227";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#00AA00",
              display: "inline-block",
            }}
          />
          {shortenAddress(address)}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 8,
              background: "#F8FAFC",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              minWidth: 160,
              zIndex: 1000,
            }}
          >
            <button
              onClick={handleCopy}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "transparent",
                color: "#1E2328",
                border: "none",
                borderRadius: "8px 8px 0 0",
                fontSize: 14,
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(201, 162, 39, 0.1)";
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "-2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.outline = "none";
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(201, 162, 39, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              📋 Copy Address
            </button>
            <div
              style={{
                height: 1,
                background: "#E5E7EB",
              }}
            />
            <button
              onClick={handleDisconnect}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "transparent",
                color: "#FF0000",
                border: "none",
                borderRadius: "0 0 8px 8px",
                fontSize: 14,
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)";
                e.currentTarget.style.outline = "2px solid #FF0000";
                e.currentTarget.style.outlineOffset = "-2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.outline = "none";
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              🔌 Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: "8px 16px",
          background: "#C9A227",
          color: "#1E2328",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s",
          outline: "none",
          boxShadow: "0 2px 4px rgba(201, 162, 39, 0.2)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = "2px solid #C9A227";
          e.currentTarget.style.outlineOffset = "2px";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#B8921F";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(201, 162, 39, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#C9A227";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(201, 162, 39, 0.2)";
        }}
      >
        Connect Wallet
      </button>

      <WalletConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

