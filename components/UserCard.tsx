// User card component for explore page (Zora-style design)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FollowButton from "./FollowButton";
import { useWallet } from "../contexts/WalletContext";

interface UserCardProps {
  user: {
    id: number;
    address: string;
    score: number;
    balance: string;
    followerCount: number;
    createdAt: string;
    name?: string;
    handle?: string;
    avatar?: string;
  };
  rank?: number;
}

export default function UserCard({ user, rank }: UserCardProps) {
  const { address: currentUserAddress } = useWallet();
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const date = new Date(user.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      setTimeAgo(`${diffYears}y`);
    } else if (diffMonths > 0) {
      setTimeAgo(`${diffMonths}mo`);
    } else if (diffDays > 0) {
      setTimeAgo(`${diffDays}d`);
    } else {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      setTimeAgo(`${diffHours}h`);
    }
  }, [user.createdAt]);

  // Format balance
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
  };

  // Generate display name from address
  const displayName = user.name || user.handle || `User ${user.id}`;
  const displayHandle = user.handle || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`;

  // Avatar initial
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
        borderBottom: "1px solid #E5E7EB",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#F8FAFC";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Profile Picture */}
      <Link href={`/profile/${user.handle || user.address}`}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, #C9A227 0%, #B8921F 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1E2328",
            fontWeight: 700,
            fontSize: 20,
            flexShrink: 0,
            border: "2px solid #fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            avatarInitial
          )}
        </div>
      </Link>

      {/* User Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Link
            href={`/profile/${user.handle || user.address}`}
            style={{
              textDecoration: "none",
              color: "#1E2328",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {displayName}
          </Link>
          {rank !== undefined && rank < 3 && (
            <span style={{ fontSize: 16 }}>
              {rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* ATH (All-Time High) - Using balance as ATH */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>ATH</span>
            <span style={{ fontSize: 14, color: "#1E2328", fontWeight: 600 }}>
              {formatBalance(user.balance)} NOP
            </span>
            <div
              style={{
                width: 40,
                height: 4,
                background: "#E5E7EB",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "75%",
                  height: "100%",
                  background: "linear-gradient(90deg, #C9A227 0%, #B8921F 100%)",
                }}
              />
            </div>
          </div>

          {/* Current Value - Using score */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 14, color: "#00AA00" }}>↑</span>
            <span style={{ fontSize: 14, color: "#1E2328", fontWeight: 600 }}>
              {user.score.toLocaleString("tr-TR")} Skor
            </span>
          </div>

          {/* Total Volume - Using balance */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#666" }}>🕐</span>
            <span style={{ fontSize: 14, color: "#666" }}>
              {formatBalance(user.balance)} NOP
            </span>
          </div>

          {/* Followers */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#666" }}>👥</span>
            <span style={{ fontSize: 14, color: "#1E2328", fontWeight: 600 }}>
              {user.followerCount.toLocaleString("tr-TR")}
            </span>
          </div>

          {/* Time */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#666" }}>{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Follow Button */}
      <div style={{ flexShrink: 0 }}>
        {currentUserAddress && currentUserAddress.toLowerCase() !== user.address.toLowerCase() && (
          <FollowButton
            targetAddress={user.address}
            targetName={displayName}
            targetHandle={displayHandle}
            currentUserAddress={currentUserAddress}
          />
        )}
      </div>
    </div>
  );
}

