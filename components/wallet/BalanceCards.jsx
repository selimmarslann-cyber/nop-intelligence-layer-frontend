// components/wallet/BalanceCards.jsx
export default function BalanceCards({ loading, balance, staked, rewards, onClaimClick }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
      <Card title="Puan Bakiyesi" value={balance} hint="Site içi NOP" />
      <Card title="Staked" value={staked} hint="Stake havuzu" />
      <Card
        title="Ödül (puan)"
        value={rewards}
        hint="Dağıtım algoritmasına göre birikir"
        action={{ label:"Claim", onClick: onClaimClick }}
      />
    </div>
  );
}

function Card({ title, value, hint, action }) {
  return (
    <div style={card}>
      <div style={{ fontSize:13, color:"#666" }}>{title}</div>
      <div style={{ fontSize:24, fontWeight:800, marginTop:6 }}>{value}</div>
      <div style={{ fontSize:12, color:"#888", marginTop:4 }}>{hint}</div>
      {action && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={action.onClick}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #C9A227";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
            style={btnPrimary}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}

const card = {
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: 16,
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};

const btnPrimary = {
  background: "#C9A227",
  color: "#1E2328",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  transition: "all 0.2s",
  outline: "none",
};

// Add focus ring for accessibility
const btnPrimaryWithFocus = {
  ...btnPrimary,
  ":focus": {
    outline: "2px solid #C9A227",
    outlineOffset: "2px",
  },
};
