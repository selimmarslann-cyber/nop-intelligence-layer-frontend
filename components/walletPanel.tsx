import React, { useMemo } from "react";

type Props = {
  address?: string;          // "0xC694..." (isteğe bağlı)
  balanceTokens?: number;    // cüzdandaki NOP (token)
  stakedTokens?: number;     // stake edilen NOP (token)
  points?: number;           // uygulama içi POINTS (NOP puan)
  onDepositClick?: () => void;
  onWithdrawClick?: () => void;
  onStakeClick?: () => void;
  onUnstakeClick?: () => void;
};

export default function WalletPanel({
  address,
  balanceTokens = 0,
  stakedTokens = 0,
  points = 0,
  onDepositClick,
  onWithdrawClick,
  onStakeClick,
  onUnstakeClick,
}: Props) {
  const shortAddr = useMemo(() => {
    if (!address) return "—not connected—";
    return address.slice(0, 6) + "…" + address.slice(-4);
    // ör: 0xC694…A1b2
  }, [address]);

  const row = (label: string, value: string | number) => (
    <div style={{
      display:"flex", justifyContent:"space-between",
      padding:"6px 0", borderBottom:"1px dashed #eee"
    }}>
      <span style={{color:"#666"}}>{label}</span>
      <strong style={{color:"#111"}}>{value}</strong>
    </div>
  );

  const btn = (text: string, onClick?: () => void, kind: "pri" | "sec" = "pri") => (
    <button
      onClick={onClick}
      style={{
        padding:"8px 10px",
        borderRadius:8,
        border: kind === "pri" ? "1px solid #1a73e8" : "1px solid #ddd",
        background: kind === "pri" ? "#1a73e8" : "#fff",
        color: kind === "pri" ? "#fff" : "#111",
        cursor:"pointer",
        fontWeight:600
      }}
    >
      {text}
    </button>
  );

  return (
    <section style={{
      background:"#fff",
      border:"1px solid #eaeaea",
      borderRadius:12,
      padding:16,
      boxShadow:"0 4px 14px rgba(0,0,0,.06)"
    }}>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <h3 style={{margin:0, fontSize:16}}>Wallet</h3>
        <code style={{fontSize:12, color:"#555"}}>{shortAddr}</code>
      </header>

      {row("POINTS (uygulama içi)", points.toLocaleString())}
      {row("Cüzdan NOP (token)", balanceTokens.toLocaleString())}
      {row("Stake NOP", stakedTokens.toLocaleString())}

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12}}>
        {btn("Deposit", onDepositClick, "pri")}
        {btn("Withdraw", onWithdrawClick, "sec")}
        {btn("Stake", onStakeClick, "pri")}
        {btn("Unstake", onUnstakeClick, "sec")}
      </div>

      <p style={{marginTop:10, fontSize:12, color:"#666"}}>
        Not: Uygulama içi **POINTS** bakiyesi on-chain değildir; çekim sırasında NOP tokene dönüştürülür.
      </p>
    </section>
  );
}
