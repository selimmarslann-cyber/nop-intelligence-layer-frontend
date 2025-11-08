// pages/index.jsx
// Main homepage with full UI
import { useEffect, useState } from "react";
import Layout from "../components/layout";
import Sidebar from "../components/Sidebar";
import Rightbar from "../components/Rightbar";
import ContributionFeed from "../components/contributionfeed";
import ContributionComposer from "../components/contributioncomposer";
import { enhanceHomeUI } from "../src/lib/ui-enhancer";
import { useWallet } from "../contexts/WalletContext";

// Use centralized API base
import { API_URL } from "../src/lib/api";

export default function HomePage() {
  const { address } = useWallet();
  const [backendStatus, setBackendStatus] = useState("checking...");
  const [aiStatus, setAiStatus] = useState("checking...");
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    // Listen for contribution composer open/close events
    const handleOpenComposer = () => {
      setShowComposer(true);
    };

    const handleCloseComposer = () => {
      setShowComposer(false);
    };

    window.addEventListener("open-contribution-composer", handleOpenComposer);
    window.addEventListener("close-contribution-composer", handleCloseComposer);

    return () => {
      window.removeEventListener("open-contribution-composer", handleOpenComposer);
      window.removeEventListener("close-contribution-composer", handleCloseComposer);
    };
  }, []);

  useEffect(() => {
    // Backend health check (only once on mount)
      fetch(`${API_URL}/api/health`)
      .then((res) => (res.ok ? res.json() : { status: "error" }))
      .then((data) => setBackendStatus(data.status || "ok"))
      .catch(() => setBackendStatus("error"));

    // OpenRouter API health check (only once on mount, cached on backend)
      fetch(`${API_URL}/api/ai/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.status === "healthy") {
          setAiStatus("healthy");
        } else {
          setAiStatus(`error: ${data.error || "unhealthy"}`);
        }
      })
      .catch((err) => setAiStatus(`error: ${err.message || "connection failed"}`));

    // UI Enhancements - run after DOM is ready
    const timer = setTimeout(() => {
      enhanceHomeUI();
    }, 100);

    // Re-run on DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      enhanceHomeUI();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <Layout>
      <div className="home-grid">
        {/* Left Sidebar */}
        <aside>
          <Sidebar />
        </aside>

        {/* Main Feed */}
        <main>
          <div className="home-mobile-contribute">
            <ContributionComposer authorId={address || "anonymous"} />
          </div>

          {/* Status Cards */}
          <div className="home-status-cards">
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: 12,
                fontSize: 13,
              }}
            >
              <strong>Backend:</strong>{" "}
              <span style={{ color: backendStatus === "ok" ? "#00AA00" : "#FF0000" }}>
                {backendStatus}
              </span>
            </div>
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: 12,
                fontSize: 13,
              }}
            >
              <strong>AI API:</strong>{" "}
              <span
                style={{
                  color: aiStatus === "healthy" ? "#00AA00" : "#FF0000",
                }}
              >
                {aiStatus}
              </span>
            </div>
          </div>

          {showComposer && (
            <ContributionComposer
              authorId={address || "anonymous"}
            />
          )}

          <ContributionFeed />
        </main>

        {/* Right Sidebar */}
        <aside>
          <Rightbar />
        </aside>
      </div>
    </Layout>
  );
}

