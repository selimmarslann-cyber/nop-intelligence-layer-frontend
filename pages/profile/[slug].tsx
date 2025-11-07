// 📁 pages/profile/[slug].tsx
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Rightbar from '../../components/Rightbar';
import PostCard from '../../components/PostCard';
import ScoreCard from '../../components/scorecard';
import FollowButton from '../../components/FollowButton';
import { useWallet } from '../../contexts/WalletContext';
import {
  getUser,
  getUserPosts,
  getSaved,
  getDrafts,
} from '../../utils/store';
import { useState, useEffect } from 'react';

// sekmeler (tabs) – sabit bir dizi
const TABS = ['Contributions', 'Scores', 'Saved', 'Drafts'] as const;

export default function Profile() {
  const router = useRouter();
  const { address } = useWallet();

  // ---------------------------  slug parametresi  ---------------------------
  // URL'de `/profile/[something]` olduğu için Next.js router.query içinde bu
  // değeri `slug` adıyla okuyacağız.
  const slug = (router.query.slug ?? 'you') as string;   // varsayılan "you"

  // Kullanıcı bilgilerini çekiyoruz (store.js içinde tanımlı)
  const user = getUser(slug);

  // aktif sekme (tab) durumu
  const [tab, setTab] = useState<typeof TABS[number]>('Contributions');
  
  // Get target address from slug (in real app, this would come from API)
  // For now, we'll use a mock address based on handle
  const [targetAddress, setTargetAddress] = useState<string>("");
  
  useEffect(() => {
    // In a real app, fetch user address from API using slug/handle
    // For now, we'll generate a mock address
    const mockAddress = `0x${user.handle.slice(0, 8).padEnd(40, "0")}`;
    setTargetAddress(mockAddress);
  }, [user.handle]);

  // -------------------------------------------------------------------------
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '16px 0' }}>
        <div className="grid">
          <Sidebar active="profile" />

          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* -------------------- Kullanıcı başlığı -------------------- */}
            <header className="card" style={{ padding: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h2 style={{ margin: '0 0 4px 0' }}>
                    {user.name}{' '}
                    <span style={{ color: 'var(--muted)' }}>
                      @{user.handle}
                    </span>
                  </h2>
                  <div style={{ color: 'var(--muted)' }}>{user.bio}</div>
                </div>

                <div>
                  <FollowButton
                    targetAddress={targetAddress}
                    targetName={user.name}
                    targetHandle={user.handle}
                    currentUserAddress={address || undefined}
                  />
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                {user.badges.map((b) => (
                  <span key={b} className="badge">
                    {b}
                  </span>
                ))}
                <span className="badge">Total {user.totalScore}</span>
              </div>
            </header>

            {/* -------------------- Sekme (tab) butonları -------------------- */}
            <div className="card" style={{ padding: 8, display: 'flex', gap: 8 }}>
              {TABS.map((t) => (
                <button
                  key={t}
                  className="btn"
                  onClick={() => setTab(t)}
                  style={{
                    background: tab === t ? 'var(--ink)' : '#fff',
                    color: tab === t ? '#fff' : '#111',
                    borderColor: tab === t ? 'var(--ink)' : 'var(--border)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* -------------------- İçerik bölümleri -------------------- */}
            {tab === 'Contributions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {getUserPosts(slug).map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
                {getUserPosts(slug).length === 0 && (
                  <div className="card" style={{ padding: 16 }}>
                    Henüz katkı yok.
                  </div>
                )}
              </div>
            )}

            {tab === 'Scores' && (
              <ScoreCard
                total={user.totalScore}
                parts={{ behavior: 72, reputation: 81, influence: 64 }}
              />
            )}

            {tab === 'Saved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {getSaved().filter((p): p is NonNullable<typeof p> => p !== null).map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
                {getSaved().length === 0 && (
                  <div className="card" style={{ padding: 16 }}>
                    Kayıtlı gönderin yok.
                  </div>
                )}
              </div>
            )}

            {tab === 'Drafts' && (
              <div className="card" style={{ padding: 16 }}>
                <h3 style={{ marginTop: 0 }}>Taslaklar</h3>
                {getDrafts().length === 0 ? (
                  <p style={{ color: 'var(--muted)' }}>Taslak bulunamadı.</p>
                ) : (
                  getDrafts().map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: '10px 0',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <strong>{d.title}</strong>
                      <div style={{ color: 'var(--muted)' }}>
                        {(d.tags || []).join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          <Rightbar />
        </div>
      </main>
    </>
  );
}
