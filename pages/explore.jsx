// 📁 pages/explore.jsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import { API_URL } from '../src/lib/api';
import { searchPostsGROQ } from '../utils/sanity';   // <-- yeni import

// ==================== Server‑Side Props ====================
export async function getServerSideProps(context) {
  const { q = '', tag = '' } = context.query;

  // SSR'de token kullanılabildiği için aynı fonksiyonu çağırıyoruz.
  let list = [];
  try {
    list = await searchPostsGROQ({ q, tag });
  } catch (err) {
    console.error('Error fetching posts:', err);
    // Return empty list if Sanity is not configured
  }

  return {
    props: {
      initialList: list,
      initialQuery: q,
      initialTag: tag,
    },
  };
}

// ==================== Component ====================
export default function Explore({ initialList, initialQuery, initialTag }) {
  const r = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [tag, setTag] = useState(initialTag);
  const [list, setList] = useState(initialList);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState('creators');

  // Fetch users for creators tab
  useEffect(() => {
    if (activeTab === 'creators') {
      async function fetchUsers() {
        setLoadingUsers(true);
        try {
            const res = await fetch(`${API_URL}/api/explore/users?limit=20`);
          if (res.ok) {
            const data = await res.json();
            if (data.ok && data.users && data.users.length > 0) {
              setUsers(data.users);
            } else {
              // Mock data for testing
              setUsers([
                { id: 1, address: '0x1234567890123456789012345678901234567890', score: 1250, balance: '1500000', followerCount: 245, createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), handle: 'aegean', name: 'Aegean' },
                { id: 2, address: '0x2345678901234567890123456789012345678901', score: 1180, balance: '1200000', followerCount: 198, createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), handle: 'sarahwong', name: 'Sarah Wong' },
                { id: 3, address: '0x3456789012345678901234567890123456789012', score: 1050, balance: '980000', followerCount: 156, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), handle: 'altinoran', name: 'Altın Oran' },
                { id: 4, address: '0x4567890123456789012345678901234567890123', score: 920, balance: '850000', followerCount: 134, createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), handle: 'crypto_dev', name: 'Crypto Dev' },
                { id: 5, address: '0x5678901234567890123456789012345678901234', score: 880, balance: '720000', followerCount: 112, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), handle: 'blockchain_ai', name: 'Blockchain AI' },
                { id: 6, address: '0x6789012345678901234567890123456789012345', score: 750, balance: '650000', followerCount: 98, createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), handle: 'web3builder', name: 'Web3 Builder' },
                { id: 7, address: '0x7890123456789012345678901234567890123456', score: 680, balance: '580000', followerCount: 87, createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), handle: 'defi_master', name: 'DeFi Master' },
                { id: 8, address: '0x8901234567890123456789012345678901234567', score: 620, balance: '520000', followerCount: 76, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), handle: 'nft_creator', name: 'NFT Creator' },
                { id: 9, address: '0x9012345678901234567890123456789012345678', score: 580, balance: '480000', followerCount: 65, createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), handle: 'zk_researcher', name: 'ZK Researcher' },
                { id: 10, address: '0xa012345678901234567890123456789012345678', score: 540, balance: '420000', followerCount: 54, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), handle: 'dao_governor', name: 'DAO Governor' },
              ]);
            }
          }
        } catch (err) {
          console.error('Users fetch error:', err);
          // Mock data on error
          setUsers([
            { id: 1, address: '0x1234567890123456789012345678901234567890', score: 1250, balance: '1500000', followerCount: 245, createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), handle: 'aegean', name: 'Aegean' },
            { id: 2, address: '0x2345678901234567890123456789012345678901', score: 1180, balance: '1200000', followerCount: 198, createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), handle: 'sarahwong', name: 'Sarah Wong' },
            { id: 3, address: '0x3456789012345678901234567890123456789012', score: 1050, balance: '980000', followerCount: 156, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), handle: 'altinoran', name: 'Altın Oran' },
            { id: 4, address: '0x4567890123456789012345678901234567890123', score: 920, balance: '850000', followerCount: 134, createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), handle: 'crypto_dev', name: 'Crypto Dev' },
            { id: 5, address: '0x5678901234567890123456789012345678901234', score: 880, balance: '720000', followerCount: 112, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), handle: 'blockchain_ai', name: 'Blockchain AI' },
          ]);
        } finally {
          setLoadingUsers(false);
        }
      }
      fetchUsers();
    }
  }, [activeTab]);

  // client‑side'da URL değiştiğinde (ör. tarayıcı Geri/İleri) veriyi yeniden çek
  useEffect(() => {
    // URL'deki query parametresi değişmişse, backend'den tekrar sorgula
    const handleRouteChange = async (url) => {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const newQ = params.get('q') ?? '';
      const newTag = params.get('tag') ?? '';
      setQ(newQ);
      setTag(newTag);
      const fresh = await searchPostsGROQ({ q: newQ, tag: newTag });
      setList(fresh);
    };

    r.events.on('routeChangeComplete', handleRouteChange);
    return () => r.events.off('routeChangeComplete', handleRouteChange);
  }, [r.events]);

  // -------------------------------------------------
  function onSubmit(e) {
    e.preventDefault();
    r.push(
      `/explore?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}`
    );
  }

  // -------------------------------------------------
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '16px 0' }}>
        <div className="grid">
          <Sidebar active="explore" />

          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div className="card" style={{ padding: 16 }}>
              <h1 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 700, color: '#1E2328' }}>
                Keşfet
              </h1>

              {/* Search Results Info */}
              {(q || tag) && (
                <div style={{ marginBottom: 16, padding: 12, background: '#F8FAFC', borderRadius: 8, fontSize: 14 }}>
                  <strong>Arama:</strong> {q && <span style={{ color: '#C9A227' }}>"{q}"</span>}
                  {tag && <span style={{ color: '#C9A227', marginLeft: 8 }}>#{tag}</span>}
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setActiveTab('creators')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'creators' ? '#1E2328' : 'transparent',
                    color: activeTab === 'creators' ? '#F8FAFC' : '#1E2328',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textDecoration: activeTab === 'creators' ? 'underline' : 'none',
                  }}
                >
                  Kullanıcılar
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'posts' ? '#1E2328' : 'transparent',
                    color: activeTab === 'posts' ? '#F8FAFC' : '#1E2328',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textDecoration: activeTab === 'posts' ? 'underline' : 'none',
                  }}
                >
                  Gönderiler
                </button>
              </div>
            </div>

            {/* Creators Tab */}
            {activeTab === 'creators' && (
              <div className="card" style={{ padding: 16 }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#1E2328' }}>
                  En Çok Takip Edilenler
                </h2>

                {loadingUsers && (
                  <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                    Yükleniyor...
                  </div>
                )}

                {!loadingUsers && users.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                    Henüz kullanıcı bulunamadı.
                  </div>
                )}

                {!loadingUsers && users.length > 0 && (
                  <div>
                    {users.map((user, index) => (
                      <UserCard key={user.id} user={user} rank={index} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <>
                <div className="card" style={{ padding: 12 }}>
                  <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Ara"
                      style={{
                        flex: 1,
                        height: 40,
                        padding: '0 12px',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                      }}
                    />
                    <input
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="Tag (örn: AI)"
                      style={{
                        width: 200,
                        height: 40,
                        padding: '0 12px',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                      }}
                    />
                    <button className="btn btn-blue">Filtrele</button>
                  </form>
                </div>

                {list.length === 0 ? (
                  <div className="card" style={{ padding: 16 }}>
                    Sonuç bulunamadı.
                  </div>
                ) : (
                  list.map((p) => <PostCard key={p.id} post={p} />)
                )}
              </>
            )}
          </section>

          <Rightbar />
        </div>
      </main>
    </>
  );
}
