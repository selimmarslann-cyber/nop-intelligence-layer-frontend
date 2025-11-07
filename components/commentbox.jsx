// 📁 components/CommentBox.jsx
// Basit yorum kutusu (UI - backend yok)
import { useState } from 'react';

export default function CommentBox({ onSubmit }){
  const [txt, setTxt] = useState('');
  return (
    <div className="card" style={{padding:12}}>
      <textarea
        placeholder="Yorum yaz…"
        rows={3}
        value={txt}
        onChange={e=>setTxt(e.target.value)}
        style={{width:'100%', padding:'8px 12px', border:'1px solid var(--border)', borderRadius:10}}
      />
      <div style={{marginTop:8, display:'flex', gap:8, justifyContent:'flex-end'}}>
        <button className="btn" onClick={() => { setTxt(''); onSubmit?.(txt); }}>Gönder</button>
      </div>
    </div>
  );
}
