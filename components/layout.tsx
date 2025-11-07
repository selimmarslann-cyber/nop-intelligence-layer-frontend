import React from "react";
import Footer from "./footer"; // ✅ footer dosyasını çağırıyoruz
import BalancePill from "./BalancePill";
import ConnectWalletButton from "./wallet/ConnectWalletButton";
import MarketTicker from "./MarketTicker";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111" }}>
      {/* ======= MARKET TICKER ======= */}
      <MarketTicker />
      
      {/* ======= HEADER ======= */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "saturate(180%) blur(10px)",
          background: "rgba(255,255,255,.85)",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>NOP Intelligence Layer</div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              id="search-input"
              placeholder="Ara (#AI, #Blockchain, yazar...)"
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input = e.currentTarget as HTMLInputElement;
                  const query = input.value.trim();
                  if (query) {
                    window.location.href = `/explore?q=${encodeURIComponent(query)}`;
                  }
                }
              }}
              style={{
                flex: 1,
                height: 36,
                padding: "0 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById("search-input") as HTMLInputElement;
                const query = input?.value.trim();
                if (query) {
                  window.location.href = `/explore?q=${encodeURIComponent(query)}`;
                }
              }}
              style={{
                height: 36,
                width: 36,
                padding: 0,
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                background: "#F8FAFC",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid #C9A227";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              title="Ara"
            >
              🔍
            </button>
          </div>
          <button
            onClick={() => {
              // Open notifications page or modal
              window.location.href = "/notifications";
            }}
            style={chip}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #C9A227";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
            title="Bildirimler"
            aria-label="Bildirimler"
          >
            🔔
          </button>
          <button
            style={chip}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #C9A227";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            👤
          </button>
          
          {/* Balance Pill & Connect Wallet - Top Right */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <ConnectWalletButton />
            <BalancePill />
          </div>
        </div>
      </header>

      {/* ======= MAIN CONTENT ======= */}
      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "18px 20px" }}>
        {children}
      </main>

      {/* ======= FOOTER ======= */}
      <Footer />
    </div>
  );
}

/* ========= STYLES ========= */

export const btnPrimary: React.CSSProperties = {
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  height: 36,
  padding: "0 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.2s",
  outline: "none",
};

export const btnGold: React.CSSProperties = {
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  height: 36,
  padding: "0 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.2s",
  outline: "none",
};

export const chip: React.CSSProperties = {
  background: "#f5f5f5",
  border: "1px solid #e5e5e5",
  height: 36,
  padding: "0 10px",
  borderRadius: 10,
  cursor: "pointer",
};

export const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 12,
  boxShadow: "0 1px 2px rgba(0,0,0,.04)",
};

export const sectionTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
  margin: "6px 0 10px",
};
