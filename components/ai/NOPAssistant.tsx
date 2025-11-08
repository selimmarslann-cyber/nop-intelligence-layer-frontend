"use client";

import { useState, useEffect, useRef } from "react";
import { API_URL } from "../../src/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function NOPAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Merhaba! Kısa, net, kaynaklı yanıtlar için hazırım.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState({
    btcDominance: "53,2%",
    marketCap: "$1,57T",
    volume24h: "$89 B",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
        const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Sen NOP Intelligence Layer platformunun AI asistanısın. Kısa, net, kaynaklı yanıtlar ver. Platform özellikleri: Twitter benzeri feed, NOP token cüzdanı, Boost Event, Trend kullanıcılar, Burn Counter, Admin paneli, Top Gainers, Referans sistemi, Stake/Unstake, Deposit/Withdraw (zkSync Era). NOP Token: 0x941Fc398d9FAebdd9f311011541045A1d66c748E.",
            },
            ...messages,
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("AI servisi yanıt veremedi");
      }

      const data = await response.json();
      if (data.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        throw new Error(data.error || "Yanıt alınamadı");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open NOP Assistant"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#C9A227",
            color: "#1E2328",
            border: "none",
            boxShadow: "0 4px 16px rgba(201, 162, 39, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(201, 162, 39, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(201, 162, 39, 0.4)";
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.3)",
              zIndex: 9998,
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Modal */}
          <div
            style={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: 420,
              maxWidth: "calc(100vw - 48px)",
              height: 600,
              maxHeight: "calc(100vh - 120px)",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #E5E7EB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
                borderRadius: "16px 16px 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#C9A227",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1E2328",
                    flexShrink: 0,
                  }}
                >
                  NOP
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1E2328" }}>
                    NOP Assistant
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      display: "flex",
                      gap: 12,
                      marginTop: 2,
                    }}
                  >
                    <span>BTC.D {marketData.btcDominance}</span>
                    <span>MCap {marketData.marketCap}</span>
                    <span>24h Vol {marketData.volume24h}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "none",
                  background: "transparent",
                  color: "#1E2328",
                  fontSize: 20,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201, 162, 39, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "#F8FAFC",
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      maxWidth: "80%",
                      background: msg.role === "user" ? "#C9A227" : "#fff",
                      color: "#1E2328",
                      border: msg.role === "assistant" ? "1px solid #E5E7EB" : "none",
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 6, paddingLeft: 4 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#C9A227",
                      animation: "bounce 1.4s infinite ease-in-out",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#C9A227",
                      animation: "bounce 1.4s infinite ease-in-out",
                      animationDelay: "0.2s",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#C9A227",
                      animation: "bounce 1.4s infinite ease-in-out",
                      animationDelay: "0.4s",
                    }}
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: "1px solid #E5E7EB",
                  display: "flex",
                  gap: 8,
                  background: "#fff",
                }}
              >
                <button
                  onClick={async () => {
                    const msg = "Dokümantasyonu göster";
                    setMessages((prev) => [...prev, { role: "user", content: msg }]);
                    setLoading(true);
                    try {
                        const response = await fetch(`${API_URL}/api/ai/chat`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          messages: [
                            {
                              role: "system",
                              content: "Sen NOP Intelligence Layer platformunun AI asistanısın. Kısa, net, kaynaklı yanıtlar ver.",
                            },
                            ...messages,
                            { role: "user", content: msg },
                          ],
                        }),
                      });
                      const data = await response.json();
                      if (data.ok && data.reply) {
                        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
                      }
                    } catch (err) {
                      setMessages((prev) => [...prev, { role: "assistant", content: "Üzgünüm, şu anda yanıt veremiyorum." }]);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 16px",
                    background: "#F8FAFC",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1E2328",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#C9A227";
                    e.currentTarget.style.borderColor = "#C9A227";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  Docs
                </button>
                <button
                  onClick={async () => {
                    const msg = "NOP token fiyatını göster";
                    setMessages((prev) => [...prev, { role: "user", content: msg }]);
                    setLoading(true);
                    try {
                        const response = await fetch(`${API_URL}/api/ai/chat`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          messages: [
                            {
                              role: "system",
                              content: "Sen NOP Intelligence Layer platformunun AI asistanısın. Kısa, net, kaynaklı yanıtlar ver.",
                            },
                            ...messages,
                            { role: "user", content: msg },
                          ],
                        }),
                      });
                      const data = await response.json();
                      if (data.ok && data.reply) {
                        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
                      }
                    } catch (err) {
                      setMessages((prev) => [...prev, { role: "assistant", content: "Üzgünüm, şu anda yanıt veremiyorum." }]);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 16px",
                    background: "#F8FAFC",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1E2328",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#C9A227";
                    e.currentTarget.style.borderColor = "#C9A227";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  Price
                </button>
              </div>
            )}

            {/* Input */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid #E5E7EB",
                background: "#fff",
                borderRadius: "0 0 16px 16px",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Sorunu yaz..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                    background: "#F8FAFC",
                    color: "#1E2328",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#C9A227";
                    e.currentTarget.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.background = "#F8FAFC";
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    padding: "12px 24px",
                    background: loading || !input.trim() ? "#E5E7EB" : "#C9A227",
                    color: loading || !input.trim() ? "#999" : "#1E2328",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = "#B8921F";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = "#C9A227";
                    }
                  }}
                >
                  Gönder
                </button>
              </div>
            </div>
          </div>

          {/* Animation */}
          <style jsx>{`
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.5;
              }
              40% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </>
      )}
    </>
  );
}

