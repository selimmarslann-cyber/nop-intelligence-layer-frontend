// components/examples/LikeButton.tsx
// Example component showing how to use useRequireWallet hook
"use client";

import { useState } from "react";
import { useRequireWallet } from "../../hooks/useRequireWallet";

interface LikeButtonProps {
  postId: string;
  initialLiked?: boolean;
}

export default function LikeButton({ postId, initialLiked = false }: LikeButtonProps) {
  const { requireWallet, WalletModal } = useRequireWallet();
  const [liked, setLiked] = useState(initialLiked);

  const handleLike = () => {
    // Require wallet before allowing like action
    requireWallet("like this post", () => {
      // This callback only runs if wallet is connected
      setLiked(!liked);
      // Here you would make an API call to like the post
      console.log(`Liking post ${postId}`);
    });
  };

  return (
    <>
      <button
        onClick={handleLike}
        style={{
          padding: "6px 12px",
          background: liked ? "#C9A227" : "transparent",
          color: liked ? "#1E2328" : "#666",
          border: `1px solid ${liked ? "#C9A227" : "#E5E7EB"}`,
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        {liked ? "❤️ Liked" : "🤍 Like"}
      </button>
      {WalletModal}
    </>
  );
}

