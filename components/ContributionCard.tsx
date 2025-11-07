// Contribution card component with rating, comments, and profile link
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getApiBase } from "../src/lib/api";
import { useWallet } from "../contexts/WalletContext";

type Post = {
  id: string;
  author: string;
  authorSlug?: string;
  minutesAgo: number;
  title: string;
  body: string;
  tags: string[];
  votes: number;
  avg?: number;
  mediaUrls?: string[];
  voteCount?: number;
  positiveVotes?: number;
  negativeVotes?: number;
};

interface ContributionCardProps {
  post: Post;
  voterId: string;
  onVote?: (postId: string, value: number) => void;
}

function linkify(text: string) {
  const url = /((https?:\/\/|www\.)[\w\-\.\/\?\=\#\&\%\+\,\:\;\~\@\!\*\(\)]+)/gi;
  return text.split(url).map((part, i) => {
    if (url.test(part)) {
      const href = part.startsWith("http") ? part : "http://" + part;
      return (
        <a key={i} href={href} target="_blank" rel="noreferrer">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ContributionCard({ post, voterId, onVote }: ContributionCardProps) {
  const { address } = useWallet();
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [voting, setVoting] = useState(false);
  const [voteStats, setVoteStats] = useState({
    voteCount: post.voteCount || post.votes || 0,
    avgScore: post.avg || 0,
    positiveVotes: post.positiveVotes || 0,
    negativeVotes: post.negativeVotes || 0,
  });
  const [comments, setComments] = useState<any[]>([]);

  // Fetch vote stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${getApiBase()}/api/contribution/${post.id}/votes`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.stats) {
            setVoteStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    }
    fetchStats();
  }, [post.id]);

  // Mock comments (replace with real API call)
  useEffect(() => {
    // Mock comments for demo
    setComments([
      { id: 1, author: "@user1", text: "Harika bir katkı!", minutesAgo: 5 },
      { id: 2, author: "@user2", text: "Çok faydalı bilgiler, teşekkürler.", minutesAgo: 12 },
    ]);
  }, []);

  const handleVote = async () => {
    if (!voterId || voting) return;

    setVoting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/contribution/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, value: rating }),
      });

      const data = await res.json();

      if (res.ok && data?.ok) {
        setVoteStats({
          voteCount: data.item.votes || voteStats.voteCount,
          avgScore: data.item.avg || voteStats.avgScore,
          positiveVotes: data.item.positiveVotes || voteStats.positiveVotes,
          negativeVotes: data.item.negativeVotes || voteStats.negativeVotes,
        });
        setShowRating(false);
        onVote?.(post.id, rating);
      } else {
        alert(data?.error || "Puanlama başarısız");
      }
    } catch (e: any) {
      console.error("[VOTE_ERROR]", e);
      alert("Puanlama sırasında bir hata oluştu");
    } finally {
      setVoting(false);
    }
  };

  return (
    <article
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        padding: 16,
        background: "#fff",
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div style={{ color: "#555", fontSize: 13, marginBottom: 8 }}>
        <Link
          href={`/profile/${post.authorSlug || post.author}`}
          style={{ color: "#111", textDecoration: "none", fontWeight: 600 }}
        >
          <strong>{post.author}</strong>
        </Link>
        {" · "}
        {post.minutesAgo} dk
        {typeof voteStats.avgScore === "number" && voteStats.avgScore > 0 && (
          <span style={{ marginLeft: 8, color: "#14804a", fontWeight: 600 }}>
            Skor {voteStats.avgScore.toFixed(1)}
          </span>
        )}
        {voteStats.voteCount > 0 && (
          <span style={{ marginLeft: 8, color: "#666", fontSize: 12 }}>
            ({voteStats.voteCount} kişi puanladı)
          </span>
        )}
      </div>

      {/* Title */}
      {post.title && <h4 style={{ margin: "6px 0", fontSize: 18, fontWeight: 600 }}>{post.title}</h4>}

      {/* Body */}
      <p style={{ margin: "6px 0", color: "#333", wordBreak: "break-word", lineHeight: 1.6 }}>
        {linkify(post.body)}
      </p>

      {/* Media */}
      {post.mediaUrls?.[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.mediaUrls[0]}
          alt=""
          style={{
            maxWidth: "100%",
            borderRadius: 8,
            border: "1px solid #eee",
            marginTop: 8,
          }}
        />
      )}

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
        {post.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 12,
              background: "#f3f5ff",
              border: "1px solid #e5e7ff",
              padding: "2px 6px",
              borderRadius: 6,
            }}
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Rating Section (hidden by default, shown when "Puanla" clicked) */}
      {showRating && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
          }}
        >
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#1E2328" }}>
            Puanla (1-10)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <input
              type="range"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#C9A227", minWidth: 30 }}>
              {rating}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleVote}
              disabled={voting}
              style={{
                padding: "6px 16px",
                background: "#C9A227",
                color: "#1E2328",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: voting ? "not-allowed" : "pointer",
                opacity: voting ? 0.6 : 1,
              }}
            >
              {voting ? "Gönderiliyor..." : "Gönder"}
            </button>
            <button
              onClick={() => setShowRating(false)}
              style={{
                padding: "6px 16px",
                background: "#F8FAFC",
                color: "#1E2328",
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Comments Preview */}
      {comments.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#1E2328" }}>
            Yorumlar
          </div>
          {comments.slice(0, 3).map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: "8px 0",
                fontSize: 13,
                color: "#666",
                borderBottom: "1px solid #F0F0F0",
              }}
            >
              <strong style={{ color: "#1E2328" }}>{comment.author}</strong> {comment.text}
              <span style={{ marginLeft: 8, fontSize: 11, color: "#999" }}>
                {comment.minutesAgo} dk
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid #E5E7EB",
        }}
      >
        <button
          onClick={() => {
            // TODO: Open comment modal
            alert("Yorum özelliği yakında eklenecek");
          }}
          style={{
            padding: "6px 12px",
            background: "#F8FAFC",
            color: "#1E2328",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          💬 Yorum Yap
        </button>
        <button
          onClick={() => setShowRating(!showRating)}
          style={{
            padding: "6px 12px",
            background: showRating ? "#B8921F" : "#C9A227",
            color: "#1E2328",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ⭐ Puanla
        </button>
        <Link
          href={`/profile/${post.authorSlug || post.author}`}
          style={{
            padding: "6px 12px",
            background: "#F8FAFC",
            color: "#1E2328",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          👤 Profiline Git
        </Link>
      </div>

      {/* Vote Statistics (Bottom Left) */}
      {voteStats.voteCount > 0 && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid #E5E7EB",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "#00AA00", fontWeight: 600 }}>
            {voteStats.positiveVotes} olumlu
          </span>
          <span style={{ color: "#FF0000", fontWeight: 600 }}>
            {voteStats.negativeVotes} olumsuz
          </span>
        </div>
      )}
    </article>
  );
}

