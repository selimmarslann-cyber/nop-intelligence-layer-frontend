// components/wallet/WalletHeader.jsx
export default function WalletHeader({ address, onRefresh }) {
  return (
    <div style={{ background:"#fff", borderBottom:"1px solid #eee" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontWeight:700, fontSize:18 }}>Wallet</div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:13, color:"#444" }}>
            {address ? shorten(address) : "Cüzdan bağlı değil"}
          </div>
          <button onClick={onRefresh} style={btnGhost}>↻</button>
        </div>
      </div>
    </div>
  );
}

function shorten(a="") { return a ? `${a.slice(0,6)}…${a.slice(-4)}` : ""; }

const btnGhost = {
  background:"#0040FF", color:"#fff", border:"none",
  padding:"6px 10px", borderRadius:8, cursor:"pointer"
};
