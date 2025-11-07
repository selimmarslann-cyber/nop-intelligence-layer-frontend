import React, { useEffect, useState } from "react";
import { getApiBase } from "../src/lib/api";
import ContributionCard from "./ContributionCard";
import { useWallet } from "../contexts/WalletContext";

type Post = {
  id:string; author:string; authorSlug?:string;
  minutesAgo:number; title:string; body:string; tags:string[];
  votes:number; avg?:number; mediaUrls?:string[];
  voteCount?: number;
  positiveVotes?: number;
  negativeVotes?: number;
};

export default function ContributionFeed() {
  const { address } = useWallet();
  const [items, setItems] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(reset=false){
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("take","10"); 
      if (!reset && cursor) qs.set("cursor", cursor);
      
      const apiBase = getApiBase();
      const url = `${apiBase}/api/feed?${qs.toString()}`;
      
      console.log("[Feed] Fetching from:", url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      const list = Array.isArray(data?.items) ? data.items : [];
      
      setItems(prev => reset ? list : [...prev, ...list]);
      setCursor(data?.nextCursor || null);
    } catch (e: any) {
      console.error("[FEED_FETCH_ERROR]", e);
      // Don't throw - just log and show empty state
      setItems(prev => reset ? [] : prev);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    const handler = (e: any) => { setItems(prev => [e.detail, ...prev]); };
    window.addEventListener("feed:refresh", handler);
    return ()=>window.removeEventListener("feed:refresh", handler);
  },[]);
  useEffect(()=>{ load(true); },[]);

  const handleVote = (postId: string, value: number) => {
    // Refresh the post data after voting
    setItems(prev =>
      prev.map(p => {
        if (p.id === postId) {
          // Update will be handled by ContributionCard's own state
          return p;
        }
        return p;
      })
    );
  };

  const handleContribute = () => {
    // Open contribution composer modal or navigate to new contribution page
    window.dispatchEvent(new CustomEvent("open-contribution-composer"));
  };

  return (
    <section style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, position: "relative" }}>
        <button
          onClick={handleContribute}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#C9A227",
            color: "#1E2328",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 300,
            lineHeight: 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid #C9A227";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
          title="Yeni Katkı Ekle"
          aria-label="Yeni Katkı Ekle"
        >
          +
        </button>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        {items.map(p => (
          <ContributionCard
            key={p.id}
            post={p}
            voterId={address || "anonymous"}
            onVote={handleVote}
          />
        ))}
      </div>

      <div style={{marginTop:12, textAlign:"center"}}>
        {cursor ? (
          <button disabled={loading} onClick={()=>load(false)}
                  style={{background:"#fff", border:"1px solid #ddd", borderRadius:8, padding:"8px 12px", cursor:"pointer"}}>
            {loading ? "Yükleniyor…" : "Daha Fazla"}
          </button>
        ) : (
          <div style={{color:"#777", fontSize:13}}>Hepsi bu kadar.</div>
        )}
      </div>
    </section>
  );
}
