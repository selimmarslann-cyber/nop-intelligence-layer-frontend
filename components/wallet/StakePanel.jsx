// components/wallet/StakePanel.jsx
"use client";
import { useState } from "react";
import { API_URL } from "../../src/lib/api";

export default function StakePanel({ address, onChanged }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function post(path, body) {
    const r = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  }

  async function doStake() {
    if (!address) return setMsg("Cüzdan bağlı değil.");
    const n = Number(amount || "0");
    if (!n || n <= 0) return setMsg("Geçerli miktar gir.");
    setBusy(true); setMsg("");
    try {
      await post("/api/stake", { address, amount: n });
      setAmount("");
      setMsg("Stake başarılı.");
      onChanged?.();
    } catch (e) {
      setMsg(parseErr(e));
    } finally { setBusy(false); }
  }

  async function doUnstake() {
    if (!address) return setMsg("Cüzdan bağlı değil.");
    const n = Number(amount || "0");
    if (!n || n <= 0) return setMsg("Geçerli miktar gir.");
    setBusy(true); setMsg("");
    try {
      await post("/api/unstake", { address, amount: n });
      setAmount("");
      setMsg("Unstake başarılı.");
      onChanged?.();
    } catch (e) {
      setMsg(parseErr(e));
    } finally { setBusy(false); }
  }

  return (
    <div style={card}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <h3 style={{ margin:0, fontSize:18 }}>Stake</h3>
        <small style={{ color:"#777" }}>Ödüller puan olarak birikir</small>
      </div>

      <div style={{ marginTop:12 }}>
        <input
          value={amount}
          onChange={e=>setAmount(e.target.value)}
          placeholder="Miktar (puan)"
          disabled={busy}
          style={input}
        />
      </div>

      <div style={{ display:"flex", gap:8, marginTop:10 }}>
        <button onClick={doStake} disabled={busy || !address} style={btnBlue}>
          {busy ? "Bekleyin…" : "Stake Et (puan→staked)"}
        </button>
        <button onClick={doUnstake} disabled={busy || !address} style={btnGhost}>
          {busy ? "Bekleyin…" : "Unstake (staked→puan)"}
        </button>
      </div>

      {msg && <div style={{ marginTop:8, fontSize:13, color: msg.startsWith("Hata") ? "red" : "#333" }}>{msg}</div>}

      <div style={{ marginTop:10, fontSize:12, color:"#777" }}>
        Not: Bu işlemler <b>site içi puan</b> üzerinde yapılır. Token yalnızca <b>çekme/yatırma</b> anında hareket eder.
      </div>
    </div>
  );
}

function parseErr(e){ try{ return "Hata: " + (e.message || e);}catch{ return "Hata"; }}

const card = { background:"#fff", border:"1px solid #eaeaea", borderRadius:12, padding:16, boxShadow:"0 6px 18px rgba(0,0,0,.06)" };
const input = { width:"100%", padding:"10px 12px", border:"1px solid #ddd", borderRadius:8 };
const btnBlue = { background:"#0040FF", color:"#fff", border:"none", padding:"10px 12px", borderRadius:8, cursor:"pointer" };
const btnGhost = { background:"#f2f2f2", color:"#111", border:"1px solid #ddd", padding:"10px 12px", borderRadius:8, cursor:"pointer" };
