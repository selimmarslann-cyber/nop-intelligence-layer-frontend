// 📁 pages/scores.jsx
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import ScoreCard from '../components/scorecard';

export default function Scores(){
  const total = 1234;
  const parts = { behavior: 76, reputation: 84, influence: 65 };

  return (
    <>
      <Navbar />
      <main className="container" style={{padding:'16px 0'}}>
        <div className="grid">
          <Sidebar active="scores" />
          <section style={{display:'flex', flexDirection:'column', gap:16}}>
            <ScoreCard total={total} parts={parts} />
            <div className="card" style={{padding:16}}>
              <h3 style={{marginTop:0}}>Skor Geçmişi</h3>
              <p style={{color:'var(--muted)'}}>Basit mock metin: Grafiği backend gelince çizeceğiz. Şimdilik son 7 gün: 1120 → 1234.</p>
            </div>
            <div className="card" style={{padding:16}}>
              <h3 style={{marginTop:0}}>Skor Nasıl Hesaplanır?</h3>
              <p style={{color:'var(--muted)'}}>Toplam skor; behavioral, reputation ve influence alt skorlarının ağırlıklı toplamıyla bulunur.</p>
            </div>
          </section>
          <Rightbar />
        </div>
      </main>
    </>
  );
}
