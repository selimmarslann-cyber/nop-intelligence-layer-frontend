// 📁 components/ScoreCard.jsx
// Kullanıcı skor özeti + parçalı skor göstergesi (UI)
export default function ScoreCard({ total=0, parts={behavior:0,reputation:0,influence:0} }){
  return (
    <div className="card" style={{padding:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <h3 style={{margin:0}}>Knowledge Score</h3>
        <strong style={{fontSize:24}}>{total}</strong>
      </div>

      <div style={{marginTop:12}}>
        <LabelBar label="Behavior"   value={parts.behavior}   />
        <LabelBar label="Reputation" value={parts.reputation} />
        <LabelBar label="Influence"  value={parts.influence}  />
      </div>

      <div style={{marginTop:12, display:'flex', gap:8}}>
        <button className="btn" disabled>Update Score (prod’da)</button>
        <button className="btn">Nasıl hesaplanır?</button>
      </div>
    </div>
  );
}

function LabelBar({label, value}){
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:14}}>
        <span style={{color:'var(--muted)'}}>{label}</span>
        <span>{value}</span>
      </div>
      <div className="scorebar"><span style={{width:`${Math.min(100, Math.max(0, value))}%`}} /></div>
    </div>
  );
}
