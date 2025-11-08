// components/BurnCounter.jsx
// Burn Counter with barrel, flames, and flip-style 7-digit counter
import { useEffect, useState } from "react";
import { API_URL } from "../src/lib/api";

export default function BurnCounter() {
  const [total, setTotal] = useState("0");
  const [displayValue, setDisplayValue] = useState("0000000");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTotal();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadTotal, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadTotal() {
    try {
      const r = await fetch(`${API_URL}/api/burns/total`).catch(() => null);
      if (r && r.ok) {
        const data = await r.json();
        const newTotal = data.total || "0";
        setTotal(newTotal);
        animateToValue(newTotal);
      } else {
        // Fallback to mock data
        const mockTotal = "160078";
        setTotal(mockTotal);
        animateToValue(mockTotal);
      }
    } catch (e) {
      console.error("Failed to load burn total:", e);
    } finally {
      setLoading(false);
    }
  }

  function animateToValue(targetValue) {
    const target = parseInt(String(targetValue).replace(/,/g, "")) || 0;
    const current = parseInt(displayValue.replace(/,/g, "")) || 0;
    
    if (target === current) return;

    const duration = 1000; // 1 second animation
    const steps = 30;
    const stepTime = duration / steps;
    const increment = (target - current) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = Math.floor(current + increment * currentStep);
      
      if (currentStep >= steps) {
        setDisplayValue(formatTo7Digits(target));
        clearInterval(timer);
      } else {
        setDisplayValue(formatTo7Digits(newValue));
      }
    }, stepTime);
  }

  function formatTo7Digits(num) {
    const numStr = String(Math.floor(num || 0));
    // Pad to 7 digits
    return numStr.padStart(7, "0");
  }

  if (loading) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#999", fontSize: 13, textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16, position: "relative", background: "transparent" }}>
      {/* Barrel with Flames */}
      <div style={{ position: "relative", marginBottom: 16, display: "flex", justifyContent: "center" }}>
        {/* Barrel */}
        <div
          style={{
            width: 120,
            height: 140,
            background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)",
            borderRadius: "8px 8px 4px 4px",
            position: "relative",
            border: "2px solid #0a0a15",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          {/* Barrel bands */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 0,
              right: 0,
              height: 3,
              background: "#2a2a3e",
              borderTop: "1px solid #3a3a4e",
              borderBottom: "1px solid #1a1a2e",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              height: 3,
              background: "#2a2a3e",
              borderTop: "1px solid #3a3a4e",
              borderBottom: "1px solid #1a1a2e",
            }}
          />

          {/* "Burn NOP" Text on Barrel */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#00d4ff",
                lineHeight: 1.2,
                textShadow: "0 0 8px rgba(0, 212, 255, 0.5)",
              }}
            >
              Burn
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
                marginTop: 2,
              }}
            >
              NOP
            </div>
          </div>

          {/* Flames */}
          <div
            style={{
              position: "absolute",
              top: -20,
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 50,
              zIndex: 1,
            }}
          >
            {/* Main flame */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 30,
                height: 40,
                background: "linear-gradient(to top, #00d4ff 0%, #0099cc 50%, #006699 100%)",
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                boxShadow: "0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.4)",
                animation: "flicker 1.5s ease-in-out infinite alternate",
              }}
            />
            {/* Left flame */}
            <div
              style={{
                position: "absolute",
                bottom: 5,
                left: 5,
                width: 18,
                height: 25,
                background: "linear-gradient(to top, #00d4ff 0%, #0099cc 100%)",
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                boxShadow: "0 0 15px rgba(0, 212, 255, 0.5)",
                animation: "flicker 1.2s ease-in-out infinite alternate",
                animationDelay: "0.3s",
              }}
            />
            {/* Right flame */}
            <div
              style={{
                position: "absolute",
                bottom: 5,
                right: 5,
                width: 18,
                height: 25,
                background: "linear-gradient(to top, #00d4ff 0%, #0099cc 100%)",
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                boxShadow: "0 0 15px rgba(0, 212, 255, 0.5)",
                animation: "flicker 1.4s ease-in-out infinite alternate",
                animationDelay: "0.6s",
              }}
            />
            {/* Small floating particle */}
            <div
              style={{
                position: "absolute",
                top: -5,
                left: "50%",
                transform: "translateX(-50%)",
                width: 8,
                height: 8,
                background: "#00d4ff",
                borderRadius: "50%",
                boxShadow: "0 0 10px rgba(0, 212, 255, 0.8)",
                animation: "float 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* "NOP BURNED" Label */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#fff",
          textAlign: "center",
          marginBottom: 12,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        NOP BURNED
      </div>

      {/* 7-Digit Flip Counter */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          marginBottom: 8,
        }}
      >
        {displayValue.split("").map((digit, index) => (
          <div
            key={index}
            style={{
              width: 32,
              height: 48,
              background: "#1a1a1a",
              border: "2px solid #0a0a0a",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {/* Flip-style lines */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 1,
                background: "#0a0a0a",
                transform: "translateY(-50%)",
              }}
            />
            {/* Digit */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
                fontFamily: "monospace",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                letterSpacing: 0,
              }}
            >
              {digit}
            </div>
          </div>
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes flicker {
          0% {
            opacity: 0.9;
            transform: translateX(-50%) scaleY(1);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scaleY(1.1);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
            opacity: 0.8;
          }
          50% {
            transform: translateX(-50%) translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
