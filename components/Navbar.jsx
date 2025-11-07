// 📁 components/Navbar.jsx
// Üst bar: logo, arama, Contribute, bildirim ve profil
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar(){
  const [q,setQ] = useState('');
  return (
    <header style={{
      position:'sticky', top:0, zIndex:50, background:'#fff',
      borderBottom:'1px solid var(--border)'
    }}>
      <div className="container" style={{display:'flex',alignItems:'center',gap:16, height:64}}>
        <Link href="/"><strong style={{fontSize:20}}>NOP Intelligence Layer</strong></Link>

        <form onSubmit={(e)=>{e.preventDefault(); window.location.href='/explore?q='+encodeURIComponent(q)}}
              style={{flex:1, display:'flex', gap:8}}>
          <input
            value={q} onChange={(e)=>setQ(e.target.value)}
            placeholder="Ara (⌘K) — #AI, #Blockchain, yazar…"
            style={{
              flex:1, height:40, padding:'0 12px',
              border:'1px solid var(--border)', borderRadius:10,
              outlineColor:'var(--blue)'
            }}
          />
        </form>

        <Link href="/new" className="btn btn-blue">Contribute</Link>
        <Link href="/notifications" className="btn" aria-label="Notifications">🔔</Link>
        <button className="btn" title="Wallet (UI)">0x…C694</button>
        <Link href="/profile/me" className="btn" aria-label="Profile">👤</Link>
      </div>
    </header>
  );
}
