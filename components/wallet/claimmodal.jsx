// components/wallet/ClaimModal.jsx
import { useEffect, useState } from "react";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ClaimModal({ address, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { setPreview(null); setMsg(""); }, [amount]);

  async function doPreview() {
    setMsg(""); setPreview(null);
    const n = Number(amount || "0");
    if (!n || n<=0) return setMsg("Geçerli miktar gir.");
    try {
      const r = await fetch(`${API_BASE}/api/withdraw/preview?address=${address}&amount=${n}`);
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      setPreview(d); // { amount, fee, net, min, ok }
    } catch (e) { setMsg("Önizleme alınamadı."); }
  }

  async function doClaim() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch(`${API_BASE}/api/withdraw`, {
        method:"POST",
        headers:{ "Content-Type": "application/json" },
        body: JSON.stringify({ address, amount: Number(amount) })
      });
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json(); // { ok, withdrawalId }
      setMsg("Çekim talebi alındı.");
      onSuccess?.();
    } catch (e) {
      setMsg("Talep alınamadı.");
    } finally { setBusy(false); }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <strong>Claim — puanı token olarak çek</strong>
          <button onClick={onClose} style={xbtn}>✕</button>
        </div>

        <div style={{ marginTop:12 }}>
          <input
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            placeholder="Miktar (puan)"
            style={input}
          />
          <div style={{ marginTop:8, display:"flex", gap:8 }}>
            <button onClick={doPreview} style={btnGhost}>Önizle</button>
            <button onClick={doClaim} disabled={busy} style={btnGold}>
              {busy ? "Gönderiliyor…" : "Talep Gönder"}
            </button>
          </div>
        </div>

        {preview && (
          <div style={{ marginTop:12, fontSize:13, color:"#333", background:"#f7f7f7", padding:10, borderRadius:8 }}>
            <div>Toplam: <b>{preview.amount}</b> puan</div>
            <div>Fee: <b>{preview.fee}</b> puan</div>
            <div>Net: <b>{preview.net}</b> puan ≈ <b>{preview.netTokens}</b> token</div>
            <div>Min limit: {preview.min} puan</div>
          </div>
        )}

        {msg && <div style={{ marginTop:10, fontSize:13, color: msg.startsWith("Talep") ? "#0a7" : "red" }}>{msg}</div>}

        <div style={{ marginTop:12, fontSize:12, color:"#777" }}>
          Not: Token yalnızca çekim anında cüzdanına gönderilir. İşlem ücretini (gas) cüzdanın öder.
        </div>
      </div>
    </div>
  );
}

const overlay = { position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000 };
const modal   = { width:420, maxWidth:"92vw", background:"#fff", border:"1px solid #eaeaea", borderRadius:12, padding:16, boxShadow:"0 10px 30px rgba(0,0,0,.2)" };
const xbtn    = { background:"transparent", border:"none", fontSize:18, cursor:"pointer" };
const input   = { width:"100%", padding:"10px 12px", border:"1px solid #ddd", borderRadius:8 };
const btnGold = { background:"#D4B169", color:"#111", border:"none", padding:"10px 12px", borderRadius:8, cursor:"pointer" };
const btnGhost= { background:"#f2f2f2", color:"#111", border:"1px solid #ddd", padding:"10px 12px", borderRadius:8, cursor:"pointer" };
