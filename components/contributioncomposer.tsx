import React, { useMemo, useState } from "react";
import { getApiBase } from "../src/lib/api";
const EMOJIS = ["🚀","✨","🤖","🧠","📈","🔥","💎","⚙️","🧪","🔗"];

export default function ContributionComposer({ authorId }: { authorId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody]   = useState("");
  const [tags, setTags]   = useState("");
  const [file, setFile]   = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const left = useMemo(()=> 400 - body.length, [body]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4*1024*1024) { setErr("Görsel 4MB'ı geçemez."); e.target.value=""; return; }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) { setErr("Sadece JPG/PNG/WEBP/GIF."); e.target.value=""; return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function addEmoji(x:string){ setBody(prev => (prev + x).slice(0,400)); }

  async function submit(){
    setErr("");
    if (!body.trim()) { setErr("İçerik zorunlu."); return; }
    if (body.length > 400) { setErr("400 karakter sınırı."); return; }

    setLoading(true);
    try {
      // Moderation removed - content quality determined by user reactions and scores
      // Step 1: Create contribution directly
      const fd = new FormData();
      fd.append("authorId", authorId);
      fd.append("title", title);
      fd.append("body", body);
      fd.append("tags", tags);
      if (file) fd.append("image", file);

      const res = await fetch(`${getApiBase()}/api/contribution`, { method:"POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "create_failed");

      // form temizle
      setTitle(""); setBody(""); setTags(""); setFile(null); setPreview(null);

      // feed'e haber ver
      window.dispatchEvent(new CustomEvent("feed:refresh", { detail: data.item }));
    } catch(e:any) {
      setErr(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12, marginBottom:12 }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <h3 style={{margin:0}}>+ Katkı Yap</h3>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <div style={{fontSize:12, color:left < 0 ? "#c00" : "#777"}}>{left} / 400</div>
          <button
            onClick={() => {
              setTitle(""); setBody(""); setTags(""); setFile(null); setPreview(null);
              window.dispatchEvent(new CustomEvent("close-contribution-composer"));
            }}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#666",
              padding: 0,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Kapat"
          >
            ×
          </button>
        </div>
      </div>

      <input
        placeholder="Başlık (opsiyonel, max 140)"
        maxLength={140}
        value={title}
        onChange={e=>setTitle(e.target.value)}
        style={{width:"100%", padding:8, border:"1px solid #ddd", borderRadius:8, marginBottom:8}}
      />

      <textarea
        placeholder="İçerik (link ekleyebilirsin, emoji destekli)"
        rows={4}
        value={body}
        onChange={e=>setBody(e.target.value.slice(0,400))}
        style={{width:"100%", padding:8, border:"1px solid #ddd", borderRadius:8, marginBottom:8, resize:"vertical"}}
      />

      <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:8}}>
        {EMOJIS.map(e => (
          <button key={e} onClick={()=>addEmoji(e)} type="button"
                  style={{border:"1px solid #eee", background:"#fff", borderRadius:8, padding:"4px 8px", cursor:"pointer"}}>
            {e}
          </button>
        ))}
      </div>

      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onPick} />
      {preview && (
        <div style={{marginTop:8}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" style={{maxWidth:"100%", borderRadius:8, border:"1px solid #eee"}}/>
        </div>
      )}

      <input
        placeholder="Etiketler (virgülle: ai,zk,defi)"
        value={tags}
        onChange={e=>setTags(e.target.value)}
        style={{width:"100%", padding:8, border:"1px solid #ddd", borderRadius:8, margin:"8px 0"}}
      />

      {err && (
        <div style={{ 
          color:"#c00", 
          marginBottom:8,
          padding: "10px 12px",
          background: "#FFE5E5",
          borderRadius: 8,
          border: "1px solid #FF9999",
          fontSize: 13,
          lineHeight: 1.5
        }}>
          <strong>⚠️ {err}</strong>
        </div>
      )}

      <button onClick={submit} disabled={loading}
        style={{background:"#0040FF", color:"#fff", border:"none", borderRadius:8, padding:"8px 12px", cursor:"pointer"}}>
        {loading ? "Gönderiliyor…" : "Gönder"}
      </button>
    </section>
  );
}

