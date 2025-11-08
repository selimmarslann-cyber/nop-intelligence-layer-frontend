import React, { useMemo, useState } from "react";
import { getApiBase } from "../src/lib/api";

const EMOJIS = ["😀", "🚀", "🤖", "🧠", "📈", "🔥"];
const MAX_LEN = 500;

export default function ContributionComposer({ authorId }: { authorId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const left = useMemo(() => MAX_LEN - body.length, [body]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      setErr("Görsel 4MB'ı geçemez.");
      e.target.value = "";
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) {
      setErr("Sadece JPG/PNG/WEBP/GIF.");
      e.target.value = "";
      return;
    }
    setErr("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function addEmoji(x: string) {
    setBody((prev) => (prev + x).slice(0, MAX_LEN));
  }

  async function submit() {
    setErr("");
    if (!body.trim()) {
      setErr("İçerik zorunlu.");
      return;
    }
    if (body.length > MAX_LEN) {
      setErr(`${MAX_LEN} karakter sınırı.`);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("authorId", authorId);
      fd.append("title", title);
      fd.append("body", body);
      fd.append("tags", tags);
      if (file) fd.append("image", file);

      const res = await fetch(`${getApiBase()}/api/contribution`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "create_failed");

      setTitle("");
      setBody("");
      setTags("");
      setFile(null);
      setPreview(null);

      window.dispatchEvent(new CustomEvent("feed:refresh", { detail: data.item }));
    } catch (e: any) {
      setErr(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  const handleClear = () => {
    setTitle("");
    setBody("");
    setTags("");
    setFile(null);
    setPreview(null);
    setErr("");
    window.dispatchEvent(new CustomEvent("close-contribution-composer"));
  };

  const displayHandle = authorId ? `@${authorId.slice(0, 6)}…${authorId.slice(-4)}` : "@guest";
  const avatarLetter = authorId ? authorId.slice(-2).toUpperCase() : "N";

  return (
    <section
      style={{
        background: "#F9FAFB",
        border: "1px solid #E2E8F0",
        borderRadius: 24,
        padding: 28,
        marginBottom: 24,
        boxShadow: "0 24px 55px -40px rgba(15, 23, 42, 0.45)",
        maxWidth: 760,
        marginInline: "auto",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #a855f7)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 20,
            }}
            aria-hidden
          >
            {avatarLetter}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>NOP</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{displayHandle}</div>
          </div>
        </div>
        <button
          style={{
            border: "none",
            background: "transparent",
            color: "#CBD5F5",
            fontSize: 24,
            cursor: "pointer",
          }}
          title="Daha fazla"
        >
          …
        </button>
      </header>

      <input
        placeholder="Bugün hangi katkıyı yapmayı düşünüyorsun?"
        maxLength={140}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 18px",
          border: "1px solid transparent",
          borderRadius: 20,
          marginBottom: 18,
          fontSize: 22,
          fontWeight: 600,
          color: "#0f172a",
          background: "#FFFFFF",
          boxShadow: "inset 0 1px 0 rgba(148, 163, 184, 0.12)",
        }}
      />

      <div style={{ display: "flex", gap: 16 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "1px solid #E2E8F0",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            background: "#fff",
          }}
          aria-hidden
        >
          ✏️
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            placeholder="Metnini buraya yazabilir veya link paylaşabilirsin."
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_LEN))}
            style={{
              width: "100%",
              padding: "18px 20px",
              border: "1px solid #E2E8F0",
              borderRadius: 18,
              marginBottom: 16,
              resize: "vertical",
              fontSize: 16,
              lineHeight: 1.7,
              background: "#FFFFFF",
              color: "#0F172A",
              minHeight: 140,
              outlineColor: "#2563eb",
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                type="button"
                style={{
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  borderRadius: 999,
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: 18,
                  transition: "background 0.2s",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="composer-upload"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                border: "1px dashed #CBD5FF",
                background: "#F1F5FF",
                color: "#2563EB",
                padding: "16px 20px",
                borderRadius: 16,
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                width: "100%",
                justifyContent: "center",
              }}
            >
              Drag and drop your images here
            </label>
            <input
              id="composer-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onPick}
              style={{ display: "none" }}
            />
          </div>

          {preview && (
            <div style={{ marginBottom: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  borderRadius: 20,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 24px 35px -28px rgba(15, 23, 42, 0.6)",
                }}
              />
            </div>
          )}

          <input
            placeholder="Etiketler (virgülle ayır: ai, zk, defi)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              marginBottom: 18,
              fontSize: 14,
              background: "#FFFFFF",
              outlineColor: "#2563eb",
            }}
          />

          {err && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                color: "#F87171",
                marginBottom: 18,
                padding: "12px 18px",
                background: "#1F2937",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 18 }}>⚠️</span>
              {err}
            </div>
          )}

          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginTop: 10,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <IconButton label="Medya" icon="🖼️" />
              <IconButton label="GIF" icon="GIF" />
              <IconButton label="Grafik" icon="📊" />
              <IconButton label="Emoji" icon="😊" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 13,
                  color: left < 0 ? "#B91C1C" : "#94A3B8",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.max(left, 0)} / {MAX_LEN}
              </span>
              <SegmentButton active>Public</SegmentButton>
              <SegmentButton>Schedule</SegmentButton>
              <SegmentButton>AI</SegmentButton>
              <button
                onClick={submit}
                disabled={loading}
                style={{
                  background: loading ? "#93C5FD" : "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 28px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 15,
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? "Gönderiliyor…" : "Post"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

function IconButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      title={label}
      style={{
        border: "1px solid #E2E8F0",
        background: "#FFFFFF",
        borderRadius: 14,
        padding: icon === "GIF" ? "6px 14px" : "6px 12px",
        cursor: "pointer",
        fontSize: icon === "GIF" ? 12 : 18,
        fontWeight: icon === "GIF" ? 700 : 500,
        color: icon === "GIF" ? "#2563EB" : "#1E293B",
      }}
    >
      {icon}
    </button>
  );
}

function SegmentButton({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      style={{
        border: active ? "1px solid rgba(37,99,235,0.45)" : "1px solid #E2E8F0",
        background: active ? "rgba(37,99,235,0.12)" : "#FFFFFF",
        color: active ? "#2563EB" : "#475569",
        padding: "8px 16px",
        borderRadius: 14,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
