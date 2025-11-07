// 📁 pages/contribution/[postId].jsx
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Rightbar from '../../components/Rightbar';
import { getPostById } from '../../utils/store';
import Link from 'next/link';

export default function ContributionDetail() {
  // -------------------------------------------------
  // Next.js router → parametre adı artık "postId"
  // -------------------------------------------------
  const { query } = useRouter();
  const postId = query.postId ? String(query.postId) : undefined;   // undefined olursa (404) gösterilir
  const post = postId ? getPostById(postId) : undefined;

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '16px 0' }}>
        <div className="grid">
          <Sidebar />

          <section>
            {/* ---- gönderi bulunamazsa ------------------------------------------------- */}
            {!post ? (
              <div className="card" style={{ padding: 16 }}>
                Gönderi bulunamadı.
              </div>
            ) : (
              // ---- gönderi bulundu ----------------------------------------------------
              <article className="card" style={{ padding: 16 }}>
                <h1 style={{ margin: '4px 0 8px' }}>{post.title}</h1>

                <div style={{ color: 'var(--muted)' }}>
                  @{post.user} · {post.time}{' '}
                  {post.tags.map((t) => (
                    <span key={t} className="badge">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* ---- görsel -------------------------------------------------------- */}
                {post.image && (
                  <div
                    style={{
                      margin: '12px 0',
                      overflow: 'hidden',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <img
                      src={post.image}
                      alt=""
                      style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}

                {/* ---- içerik -------------------------------------------------------- */}
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {post.content || post.summary}
                </p>

                {/* ---- aksiyon butonları -------------------------------------------- */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn">❤️ Like</button>
                  <button className="btn">💬 Comment</button>
                  <button className="btn">🔖 Save</button>
                  <button className="btn">↗︎ Share</button>
                </div>
              </article>
            )}
          </section>

          {/* ------------------------------------------------- sağ panel */}
          <aside>
            {/* AI Insights ---------------------------------------------------- */}
            <div
              className="card"
              style={{ padding: 16, border: '1px solid var(--border)' }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>AI Insights</div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: 'var(--muted)',
                }}
              >
                <li>Özgünlük yüksek; teknik yoğunluk iyi.</li>
                <li>Referans link eklenirse skor +3 artabilir.</li>
                <li>Okunabilirlik: 5dk.</li>
              </ul>
              <div style={{ marginTop: 12 }}>
                <button className="btn" disabled>
                  Update Score (prod’da)
                </button>
              </div>
            </div>

            {/* Yazar kartı ---------------------------------------------------- */}
            <div className="card" style={{ padding: 16, marginTop: 16 }}>
              <div style={{ fontWeight: 700 }}>Yazar</div>
              <div style={{ color: 'var(--muted)' }}>
                @{post?.user || '-'}
              </div>
              <div style={{ marginTop: 8 }}>
                <Link href={`/profile/${post?.user || 'me'}`}>
                  Profili gör →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Rightbar (küçük ekran menüsü) */}
      <Rightbar />
    </>
  );
}
