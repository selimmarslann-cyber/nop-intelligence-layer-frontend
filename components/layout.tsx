import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "./footer"; // ✅ footer dosyasını çağırıyoruz
import BalancePill from "./BalancePill";
import ConnectWalletButton from "./wallet/ConnectWalletButton";
import MarketTicker from "./MarketTicker";

type NavLink = {
  label: string;
  href: string;
  icon: string;
  match: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "Ana Sayfa", href: "/", icon: "🏠", match: "/" },
  { label: "Katkı Yap", href: "/new", icon: "📝", match: "/new" },
  { label: "Explore", href: "/explore", icon: "🔍", match: "/explore" },
  { label: "Cüzdan", href: "/wallet", icon: "👛", match: "/wallet" },
  { label: "Scores", href: "/scores", icon: "📊", match: "/scores" },
  { label: "Profil", href: "/profile/me", icon: "👤", match: "/profile" },
  { label: "Settings", href: "/settings", icon: "⚙️", match: "/settings" },
];

const lockBodyScroll = (lock: boolean) => {
  if (typeof document === "undefined") {
    return;
  }
  document.body.style.overflow = lock ? "hidden" : "";
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    lockBodyScroll(mobileMenuOpen);
    return () => lockBodyScroll(false);
  }, [mobileMenuOpen]);

  const currentPath = useMemo(() => {
    const pathname = router?.pathname ?? "/";
    return pathname.toLowerCase();
  }, [router?.pathname]);

  const isActive = (match: string) => {
    if (match === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(match);
  };

  return (
    <div className="layout-shell">
      {/* ======= MARKET TICKER ======= */}
      <div className="layout-market-ticker">
        <MarketTicker />
      </div>

      {/* ======= HEADER ======= */}
      <header className="layout-header">
        <div className="layout-header__inner">
          {/* Mobile header */}
          <div className="layout-header__mobile">
            <button
              type="button"
              className="layout-header__burger"
              aria-label="Menüyü aç"
              onClick={() => setMobileMenuOpen(true)}
            >
              ☰
            </button>
            <Link href="/" className="layout-header__brand">
              NOP Intelligence Layer
            </Link>
            <div className="layout-header__mobile-actions">
              <Link href="/notifications" className="layout-chip" aria-label="Bildirimler">
                🔔
              </Link>
            </div>
          </div>

          {/* Desktop header */}
          <div className="layout-header__desktop">
            <div className="layout-header__brand">NOP Intelligence Layer</div>

            <div className="layout-header__search">
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
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("search-input") as HTMLInputElement | null;
                  const query = input?.value.trim();
                  if (query) {
                    window.location.href = `/explore?q=${encodeURIComponent(query)}`;
                  }
                }}
                title="Ara"
                aria-label="Ara"
              >
                🔍
              </button>
            </div>

            <div className="layout-header__actions">
              <Link href="/notifications" className="layout-chip" aria-label="Bildirimler">
                🔔
              </Link>
              <Link href="/profile/me" className="layout-chip" aria-label="Profil">
                👤
              </Link>
              <div className="layout-desktop-only">
                <ConnectWalletButton />
              </div>
              <div className="layout-desktop-only">
                <BalancePill />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <div className={`mobile-menu__overlay ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="mobile-menu">
          <div className="mobile-menu__header">
            <span>Menü</span>
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </button>
          </div>

          <nav className="mobile-menu__nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-menu__link ${isActive(link.match) ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mobile-menu__icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <Link
              href="/notifications"
              className={`mobile-menu__link ${isActive("/notifications") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-menu__icon">🔔</span>
              Bildirimler
            </Link>
          </nav>

          <div className="mobile-menu__cta">
            <ConnectWalletButton />
          </div>
        </div>
      </div>

      {/* ======= MAIN CONTENT ======= */}
      <main className="layout-main">{children}</main>

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
