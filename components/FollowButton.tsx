// Follow/Unfollow button component with NOP payment
"use client";

import { useState, useEffect } from "react";
import { getApiBase } from "../src/lib/api";
import FollowConfirmModal from "./FollowConfirmModal";

interface FollowButtonProps {
  targetAddress: string;
  targetName?: string;
  targetHandle?: string;
  currentUserAddress?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  targetAddress,
  targetName = "",
  targetHandle = "",
  currentUserAddress,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [balance, setBalance] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const FOLLOW_COST = 50000; // 50,000 NOP

  // Check follow status
  useEffect(() => {
    if (!currentUserAddress || !targetAddress) {
      setCheckingStatus(false);
      return;
    }

    async function checkStatus() {
      try {
        const res = await fetch(
          `${getApiBase()}/api/follow/status/${targetAddress}?followerAddress=${currentUserAddress}`
        );
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data.following || false);
        }
      } catch (error) {
        console.error("Follow status check error:", error);
      } finally {
        setCheckingStatus(false);
      }
    }

    checkStatus();
  }, [currentUserAddress, targetAddress]);

  // Fetch balance
  useEffect(() => {
    if (!currentUserAddress) return;

    async function fetchBalance() {
      try {
        const res = await fetch(`${getApiBase()}/api/users/${currentUserAddress}/summary`);
        if (res.ok) {
          const data = await res.json();
          setBalance(parseInt(data.balance || "0", 10));
        }
      } catch (error) {
        console.error("Balance fetch error:", error);
      }
    }

    fetchBalance();
  }, [currentUserAddress]);

  const handleFollowClick = () => {
    if (isFollowing) {
      handleUnfollow();
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmFollow = async () => {
    if (!currentUserAddress) return;

    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/follow/${targetAddress}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerAddress: currentUserAddress }),
      });

      const data = await res.json();

      if (data.ok) {
        setIsFollowing(true);
        setShowConfirm(false);
        setBalance(parseInt(data.newBalance || "0", 10));
        onFollowChange?.(true);
      } else {
        alert(data.error || "Takip işlemi başarısız");
      }
    } catch (error) {
      console.error("Follow error:", error);
      alert("Takip işlemi sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUserAddress) return;

    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/unfollow/${targetAddress}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerAddress: currentUserAddress }),
      });

      const data = await res.json();

      if (data.ok) {
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        alert(data.error || "Takibi bırakma işlemi başarısız");
      }
    } catch (error) {
      console.error("Unfollow error:", error);
      alert("Takibi bırakma işlemi sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if no current user
  if (!currentUserAddress) {
    return null;
  }

  // Don't show button if checking status
  if (checkingStatus) {
    return (
      <button
        disabled
        style={{
          padding: "8px 16px",
          background: "#E5E7EB",
          color: "#666",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: "not-allowed",
        }}
      >
        Yükleniyor...
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleFollowClick}
        disabled={loading}
        style={{
          padding: "8px 16px",
          background: isFollowing ? "#F8FAFC" : "#C9A227",
          color: isFollowing ? "#1E2328" : "#1E2328",
          border: isFollowing ? "1px solid #E5E7EB" : "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
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
            if (isFollowing) {
              e.currentTarget.style.background = "#F0F4F8";
            } else {
              e.currentTarget.style.background = "#B8921F";
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.disabled) {
            if (isFollowing) {
              e.currentTarget.style.background = "#F8FAFC";
            } else {
              e.currentTarget.style.background = "#C9A227";
            }
          }
        }}
      >
        {loading ? "..." : isFollowing ? "Takibi Bırak" : "Takip Et"}
      </button>

      <FollowConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmFollow}
        targetName={targetName}
        targetHandle={targetHandle}
        cost={FOLLOW_COST}
        currentBalance={balance}
      />
    </>
  );
}

