// 📁 components/PostCard.jsx
// Başlık, kullanıcı satırı, hashtagler, görsel, özet, skor barı, aksiyonlar
import Link from 'next/link';

export default function PostCard({post}){
  return (
    <article className="card" style={{padding:16}}>
      <header style={{marginBottom:8}}>
        <Link href={`/contribution/${post.id}`} style={{fontSize:20, fontWeight:700}}>
          {post.title}
        </Link>
        <div style={{fontSize:14, color:'var(--muted)', marginTop:6}}>
          @{post.user} · {post.time} · {post.tags.map(t=>(
            <Link key={t} href={`/explore?tag=${encodeURIComponent(t)}`} className="badge">#{t}</Link>
          ))}
        </div>
      </header>

      {post.image && (
        <div style={{margin:'10px 0', overflow:'hidden', borderRadius:10, border:'1px solid var(--border)'}}>
          <img src={post.image} alt="" style={{width:'100%', display:'block', aspectRatio:'16/9', objectFit:'cover'}} />
        </div>
      )}

      <p style={{margin:'8px 0 12px 0'}}>{post.summary}</p>

      <div className="scorebar" title={`Knowledge Score: ${post.score}`}>
        <span style={{width:`${post.score}%`}} />
      </div>

      <footer style={{display:'flex', gap:12, marginTop:12, fontSize:14}}>
        <button className="btn" title="Like">❤️ {post.likes}</button>
        <button className="btn" title="Comment">💬 {post.comments}</button>
        <button className="btn" title="Save">🔖 Save</button>
        <button className="btn" title="Share">↗︎ Share</button>
      </footer>
    </article>
  );
}
