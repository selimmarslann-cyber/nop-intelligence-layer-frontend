// 📁 components/NotificationItem.jsx
import Link from 'next/link';

const ICON = { like:'❤️', comment:'💬', follow:'👤' };

export default function NotificationItem({ n }){
  return (
    <div style={{display:'flex', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
      <div style={{fontSize:18}}>{ICON[n.type] || '🔔'}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14}}>
          <strong>@{n.who}</strong>{' '}
          {n.type==='like' && <>gönderini beğendi</>}
          {n.type==='comment' && <>yorum yaptı: “{n.text}”</>}
          {n.type==='follow' && <>seni takip etmeye başladı</>}
          {n.postId && <> — <Link href={`/contribution/${n.postId}`}>Gönderiye git</Link></>}
        </div>
        <div style={{fontSize:12, color:'var(--muted)'}}>{n.ts} önce</div>
      </div>
    </div>
  );
}
