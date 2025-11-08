// 📁 components/Rightbar.jsx
// Trend Kullanıcılar • Son Katkılar • Cüzdan Özeti (UI) • Zincir Durumu (dummy)
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BurnCounter from './BurnCounter';
import NewsPanel from './NewsPanel';
import DepositModal from './wallet/DepositModal';
import WithdrawModal from './wallet/WithdrawModal';
import { API_URL } from '../src/lib/api';
import { useWallet } from '../contexts/WalletContext';

export default function Rightbar() {
  const { address, isConnected } = useWallet();
  const [trendUsers, setTrendUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState({ balance: '0', staked: '0' });
  const [walletLoading, setWalletLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakeLoading, setStakeLoading] = useState(false);

  useEffect(() => {
    async function fetchTrendUsers() {
      try {
          const res = await fetch(`${API_URL}/api/explore/users?limit=5`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok) {
            setTrendUsers(data.users || []);
          }
        }
      } catch (err) {
        console.error('Trend users fetch error:', err);
        // Fallback to mock data
        setTrendUsers(TREND.map((u, i) => ({
          id: i,
          address: `0x${u.handle.slice(0, 8).padEnd(40, '0')}`,
          score: u.score,
          balance: '0',
          followerCount: 0,
          createdAt: new Date().toISOString(),
          handle: u.handle,
          avatar: u.avatar,
        })));
      } finally {
        setLoading(false);
      }
    }
    fetchTrendUsers();
  }, []);

  // Fetch wallet data
  useEffect(() => {
    async function fetchWalletData() {
      if (!address) {
        setWalletData({ balance: '0', staked: '0' });
        return;
      }
      setWalletLoading(true);
      try {
          const res = await fetch(`${API_URL}/api/users/${address}/summary`);
        if (res.ok) {
          const data = await res.json();
          setWalletData({
            balance: data.balance || '0',
            staked: data.staked || '0',
          });
        }
      } catch (err) {
        console.error('Wallet data fetch error:', err);
      } finally {
        setWalletLoading(false);
      }
    }
    fetchWalletData();
    const interval = setInterval(fetchWalletData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [address]);

  // Stake function
  async function handleStake() {
    if (!address || !stakeAmount || parseFloat(stakeAmount) <= 0) return;
    setStakeLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount: parseFloat(stakeAmount) }),
      });
      if (res.ok) {
        setStakeAmount('');
        // Refresh wallet data
          const summaryRes = await fetch(`${API_URL}/api/users/${address}/summary`);
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setWalletData({ balance: data.balance || '0', staked: data.staked || '0' });
        }
      }
    } catch (err) {
      console.error('Stake error:', err);
    } finally {
      setStakeLoading(false);
    }
  }

  // Unstake function
  async function handleUnstake() {
    if (!address || !unstakeAmount || parseFloat(unstakeAmount) <= 0) return;
    setStakeLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/unstake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount: parseFloat(unstakeAmount) }),
      });
      if (res.ok) {
        setUnstakeAmount('');
        // Refresh wallet data
          const summaryRes = await fetch(`${API_URL}/api/users/${address}/summary`);
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setWalletData({ balance: data.balance || '0', staked: data.staked || '0' });
        }
      }
    } catch (err) {
      console.error('Unstake error:', err);
    } finally {
      setStakeLoading(false);
    }
  }

  const handleWalletRefresh = () => {
    if (address) {
        fetch(`${API_URL}/api/users/${address}/summary`)
        .then(res => res.json())
        .then(data => {
          setWalletData({ balance: data.balance || '0', staked: data.staked || '0' });
        })
        .catch(err => console.error('Wallet refresh error:', err));
    }
  };

  const displayUsers = trendUsers.length > 0 ? trendUsers : TREND.map((u, i) => ({
    id: i,
    address: `0x${u.handle.slice(0, 8).padEnd(40, '0')}`,
    score: u.score,
    balance: '0',
    followerCount: 0,
    createdAt: new Date().toISOString(),
    handle: u.handle,
    avatar: u.avatar,
  }));

  return (
    <aside>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0', fontWeight: 700, fontSize: 16, color: '#1E2328' }}>Trend Kullanıcılar</h3>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#666', fontSize: 12 }}>
            Yükleniyor...
          </div>
        ) : (
          displayUsers.map((u, i) => (
          <div key={u.handle} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 0',
            borderBottom: i < TREND.length - 1 ? '1px solid #E5E7EB' : 'none'
          }}>
            {/* Profil Resmi */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, #C9A227 0%, #B8921F 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1E2328',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
              border: '2px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {u.avatar || (u.handle || u.address || '?').charAt(0).toUpperCase()}
            </div>

            {/* Kullanıcı Bilgisi */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Link
                  href={`/profile/${u.handle || u.address}`}
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#1E2328',
                    textDecoration: 'none',
                  }}
                >
                  @{u.handle || u.address.slice(0, 6)}
                </Link>
                {/* Madalya (top 3 için) */}
                {i < 3 && (
                  <span style={{ fontSize: 16 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>
                Score: <span style={{ color: '#C9A227', fontWeight: 700 }}>{u.score || 0}</span>
                {u.followerCount !== undefined && (
                  <> • <span style={{ color: '#666' }}>{u.followerCount} takipçi</span></>
                )}
              </div>
            </div>
          </div>
        ))
        )}
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <Link href="/explore" style={{ fontSize: 13, color: '#C9A227', textDecoration: 'none', fontWeight: 600 }}>
            Tümünü gör →
          </Link>
        </div>
      </div>

      <BurnCounter />

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0', fontWeight: 700, fontSize: 16, color: '#1E2328' }}>Kripto Haberleri</h3>
        <NewsPanel limit={4} />
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Son Katkılar</h3>
        {RECENT.map(p => (
          <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <Link href={`/contribution/${p.id}`}>{p.title}</Link>
            <div style={{ marginTop: 6 }}>
              {p.tags.map(t => <span key={t} className="badge">#{t}</span>)}
              <span className="badge">Score {p.score}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0', fontWeight: 700, fontSize: 16, color: '#1E2328' }}>Cüzdan Özeti</h3>
        
        {!isConnected || !address ? (
          <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, fontSize: 13, color: '#666', textAlign: 'center' }}>
            Cüzdan bağlanmadı
          </div>
        ) : (
          <>
            {/* Balance Display */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#666' }}>NOP Bakiyesi</span>
                <strong style={{ fontSize: 16, fontWeight: 700, color: '#1E2328', fontFamily: 'monospace' }}>
                  {walletLoading ? '...' : parseFloat(walletData.balance || '0').toLocaleString('tr-TR')} NOP
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#666' }}>Stake Edilmiş</span>
                <strong style={{ fontSize: 16, fontWeight: 700, color: '#C9A227', fontFamily: 'monospace' }}>
                  {walletLoading ? '...' : parseFloat(walletData.staked || '0').toLocaleString('tr-TR')} NOP
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <button
                onClick={() => setShowDepositModal(true)}
                disabled={!isConnected || !address}
                onFocus={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.outline = '2px solid #C9A227';
                    e.currentTarget.style.outlineOffset = '2px';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
                style={{
                  ...btnPrimary,
                  fontSize: 12,
                  padding: '8px 12px',
                  opacity: !isConnected || !address ? 0.6 : 1,
                  cursor: !isConnected || !address ? 'not-allowed' : 'pointer',
                }}
              >
                💰 Deposit
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={!isConnected || !address}
                onFocus={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.outline = '2px solid #C9A227';
                    e.currentTarget.style.outlineOffset = '2px';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
                style={{
                  ...btnPrimary,
                  fontSize: 12,
                  padding: '8px 12px',
                  background: '#1E2328',
                  color: '#F8FAFC',
                  opacity: !isConnected || !address ? 0.6 : 1,
                  cursor: !isConnected || !address ? 'not-allowed' : 'pointer',
                }}
              >
                💸 Withdraw
              </button>
            </div>

            {/* Stake/Unstake Section */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 600 }}>Stake İşlemleri</div>
              
              {/* Stake Input */}
              <div style={{ marginBottom: 8 }}>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Miktar"
                  disabled={stakeLoading || !address}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '2px solid #C9A227';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    fontSize: 12,
                    marginBottom: 6,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleStake}
                  disabled={stakeLoading || !address || !stakeAmount}
                  onFocus={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.outline = '2px solid #C9A227';
                      e.currentTarget.style.outlineOffset = '2px';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  style={{
                    ...btnPrimary,
                    width: '100%',
                    fontSize: 12,
                    padding: '6px 12px',
                    opacity: stakeLoading || !address || !stakeAmount ? 0.6 : 1,
                    cursor: stakeLoading || !address || !stakeAmount ? 'not-allowed' : 'pointer',
                  }}
                >
                  {stakeLoading ? '...' : 'Stake'}
                </button>
              </div>

              {/* Unstake Input */}
              <div>
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="Miktar"
                  disabled={stakeLoading || !address}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '2px solid #C9A227';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    fontSize: 12,
                    marginBottom: 6,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleUnstake}
                  disabled={stakeLoading || !address || !unstakeAmount}
                  onFocus={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.outline = '2px solid #C9A227';
                      e.currentTarget.style.outlineOffset = '2px';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  style={{
                    ...btnPrimary,
                    width: '100%',
                    fontSize: 12,
                    padding: '6px 12px',
                    background: '#F8FAFC',
                    color: '#1E2328',
                    border: '1px solid #E5E7EB',
                    opacity: stakeLoading || !address || !unstakeAmount ? 0.6 : 1,
                    cursor: stakeLoading || !address || !unstakeAmount ? 'not-allowed' : 'pointer',
                  }}
                >
                  {stakeLoading ? '...' : 'Unstake'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        userAddress={address}
        onSuccess={handleWalletRefresh}
      />
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        userAddress={address}
        balance={walletData.balance}
        onSuccess={handleWalletRefresh}
      />

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Zincir Durumu</h3>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>zkSync Era • Gas: low • Son blok: 12s</div>
      </div>
    </aside>
  );
}

const TREND = [
  { handle: 'aegean', score: 92, avatar: 'A' },
  { handle: 'sarahwong', score: 88, avatar: 'S' },
  { handle: 'altinoran', score: 83, avatar: 'A' },
  { handle: 'crypto_dev', score: 79, avatar: 'C' },
  { handle: 'blockchain_ai', score: 75, avatar: 'B' },
];

const RECENT = [
  { id: 'p-101', title: 'Transfer Learning Notları', tags: ['AI', 'models'], score: 78 },
  { id: 'p-102', title: 'zkRollup Nedir?', tags: ['Blockchain', 'zk'], score: 81 },
];

const btnPrimary = {
  background: '#C9A227',
  color: '#1E2328',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'all 0.2s',
  outline: 'none',
};
