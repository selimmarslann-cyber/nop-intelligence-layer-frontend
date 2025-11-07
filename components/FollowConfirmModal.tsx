// Follow confirmation modal with NOP payment warning
"use client";

import { useEffect, useRef } from "react";

interface FollowConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetName: string;
  targetHandle: string;
  cost: number; // 50,000 NOP
  currentBalance: number;
}

export default function FollowConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetName,
  targetHandle,
  cost,
  currentBalance,
}: FollowConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  const hasEnoughBalance = currentBalance >= cost;
  const formattedCost = cost.toLocaleString("tr-TR");
  const formattedBalance = currentBalance.toLocaleString("tr-TR");

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
        zIndex: 10000,
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
        aria-labelledby="follow-modal-title"
        style={{
          position: "relative",
          width: "90%",
          maxWidth: 480,
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          zIndex: 10001,
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
            id="follow-modal-title"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "#1E2328",
            }}
          >
            Takip Et
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
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: 16,
              color: "#1E2328",
              lineHeight: 1.5,
            }}
          >
            <strong>@{targetHandle}</strong> kullanıcısını takip etmek için{" "}
            <strong style={{ color: "#C9A227" }}>{formattedCost} NOP</strong> ödemeniz gerekiyor.
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#666",
              lineHeight: 1.5,
            }}
          >
            Mevcut bakiyeniz: <strong>{formattedBalance} NOP</strong>
          </p>
        </div>

        {/* Warning if insufficient balance */}
        {!hasEnoughBalance && (
          <div
            style={{
              padding: 12,
              background: "#FFE5E5",
              border: "1px solid #FF9999",
              borderRadius: 6,
              marginBottom: 20,
              fontSize: 13,
              color: "#CC0000",
            }}
          >
            ⚠️ Yetersiz bakiye! Takip etmek için en az {formattedCost} NOP gerekiyor.
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#F8FAFC",
              color: "#1E2328",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #C9A227";
              e.currentTarget.style.outlineOffset = "2px";
              e.currentTarget.style.borderColor = "#C9A227";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F0F4F8";
              e.currentTarget.style.borderColor = "#C9A227";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F8FAFC";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasEnoughBalance}
            style={{
              padding: "10px 20px",
              background: hasEnoughBalance ? "#C9A227" : "#B8921F",
              color: "#1E2328",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: hasEnoughBalance ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              outline: "none",
              opacity: hasEnoughBalance ? 1 : 0.6,
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
              e.currentTarget.style.boxShadow = "none";
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
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            Eminim, Takip Et
          </button>
        </div>
      </div>
    </div>
  );
}

