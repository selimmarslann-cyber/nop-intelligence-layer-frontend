// components/admin/AdminLayout.tsx
// Admin dashboard layout with sidebar
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadAdminInfo();
  }, []);

  async function loadAdminInfo() {
    try {
      const r = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setAdminEmail(data.email);
      } else {
        router.push("/admin/login");
      }
    } catch (e) {
      router.push("/admin/login");
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push("/admin/login");
    } catch (e) {
      router.push("/admin/login");
    }
  }

  const currentPath = router.pathname;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1E2328",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 0,
          background: "rgba(248, 250, 252, 0.05)",
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(229, 231, 235, 0.1)",
          transition: "width 0.3s",
          overflow: "hidden",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
        }}
      >
        <div style={{ padding: 20 }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "linear-gradient(135deg, #C9A227 0%, #B8921F 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "#1E2328",
              }}
            >
              NOP
            </div>
            {sidebarOpen && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>
                  Admin Panel
                </div>
                <div style={{ fontSize: 11, color: "#999" }}>Intelligence Layer</div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {sidebarOpen && (
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <NavLink href="/admin" label="Dashboard" icon="📊" active={currentPath === "/admin"} />
              <NavLink
                href="/admin/users"
                label="Users"
                icon="👥"
                active={currentPath === "/admin/users"}
              />
              <NavLink
                href="/admin/contributions"
                label="Contributions"
                icon="📝"
                active={currentPath === "/admin/contributions"}
              />
              <NavLink
                href="/admin/withdraws"
                label="Withdraws"
                icon="💰"
                active={currentPath === "/admin/withdraws"}
              />
              <NavLink
                href="/admin/burns"
                label="Burn Counter"
                icon="🔥"
                active={currentPath === "/admin/burns"}
              />
              <NavLink
                href="/admin/events"
                label="Boosted Events"
                icon="⚡"
                active={currentPath === "/admin/events"}
              />
              <NavLink
                href="/admin/health"
                label="System Health"
                icon="💚"
                active={currentPath === "/admin/health"}
              />
              <NavLink
                href="/admin/ai-monitor"
                label="AI Monitor"
                icon="🤖"
                active={currentPath === "/admin/ai-monitor"}
              />
            </nav>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 240 : 0,
          transition: "margin-left 0.3s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            background: "rgba(248, 250, 252, 0.05)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(229, 231, 235, 0.1)",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: "8px",
              background: "transparent",
              border: "1px solid rgba(229, 231, 235, 0.2)",
              borderRadius: 6,
              color: "#F8FAFC",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ☰
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#999" }}>{mounted ? (adminEmail || "Loading...") : "Loading..."}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                background: "#C9A227",
                color: "#1E2328",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            background: "#F8FAFC",
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, label, icon, active }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 8,
        background: active ? "rgba(201, 162, 39, 0.2)" : "transparent",
        color: active ? "#C9A227" : "#F8FAFC",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(201, 162, 39, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

