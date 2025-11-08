// 📁 pages/settings.jsx
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { API_URL } from '../src/lib/api';

export default function Settings(){
  const { address, isConnected } = useWallet();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nop-language') || 'tr';
    }
    return 'tr';
  });
  const [referralCode, setReferralCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadReferralCode();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nop-language', lang);
    }
  }, [lang]);

  async function loadReferralCode() {
    if (!address) return;
    setLoading(true);
    try {
        const r = await fetch(`${API_URL}/api/referral/code/${address}`);
      if (r.ok) {
        const data = await r.json();
        setReferralCode(data.referralCode || null);
      }
    } catch (e) {
      console.error('Failed to load referral code:', e);
    } finally {
      setLoading(false);
    }
  }

  async function copyReferralCode() {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container" style={{padding:'16px 0'}}>
        <div className="grid">
          <Sidebar active="settings" />

          <section style={{display:'flex', flexDirection:'column', gap:16}}>
            <div className="card" style={{padding:16}}>
              <h3 style={{marginTop:0}}>{lang === 'en' ? 'Notifications' : 'Bildirimler'}</h3>
              <label style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
                <input type="checkbox" checked={emailNotif} onChange={e=>setEmailNotif(e.target.checked)} />
                {lang === 'en' ? 'Email notifications' : 'E-posta bildirimleri'}
              </label>
              <label style={{display:'flex', gap:8, alignItems:'center'}}>
                <input type="checkbox" checked={pushNotif} onChange={e=>setPushNotif(e.target.checked)} />
                {lang === 'en' ? 'Push notifications' : 'Push bildirimleri'}
              </label>
            </div>

            <div className="card" style={{padding:16}}>
              <h3 style={{marginTop:0}}>{lang === 'en' ? 'Language' : 'Dil'}</h3>
              <select value={lang} onChange={e=>setLang(e.target.value)}
                      style={{height:40, border:'1px solid var(--border)', borderRadius:10, padding:'0 10px'}}>
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="card" style={{padding:16}}>
              <h3 style={{marginTop:0}}>{lang === 'en' ? 'Connected Wallets' : 'Bağlı Cüzdanlar'}</h3>
              <p style={{color:'var(--muted)'}}>
                {lang === 'en' 
                  ? '0x…C694 (UI) — network tests/MetaMask **later**.' 
                  : '0x…C694 (UI) — ağ testleri/MetaMask **sonra**.'}
              </p>
            </div>

            {/* Referans Kodu */}
            <div className="card" style={{padding:16}}>
              <h3 style={{marginTop:0, marginBottom:12}}>{lang === 'en' ? 'Referral Code' : 'Referans Kodu'}</h3>
              {!isConnected || !address ? (
                <p style={{color:'var(--muted)', fontSize:14}}>
                  {lang === 'en' ? 'Wallet not connected' : 'Cüzdan bağlanmadı'}
                </p>
              ) : loading ? (
                <p style={{color:'var(--muted)', fontSize:14}}>
                  {lang === 'en' ? 'Loading...' : 'Yükleniyor...'}
                </p>
              ) : referralCode ? (
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <div style={{
                    flex:1,
                    padding:'10px 12px',
                    background:'#F8FAFC',
                    border:'1px solid #E5E7EB',
                    borderRadius:8,
                    fontSize:16,
                    fontWeight:700,
                    fontFamily:'monospace',
                    letterSpacing:2,
                    color:'#1E2328',
                  }}>
                    {referralCode}
                  </div>
                  <button
                    onClick={copyReferralCode}
                    style={{
                      padding:'10px 16px',
                      background:copied ? '#00AA00' : '#C9A227',
                      color:'#1E2328',
                      border:'none',
                      borderRadius:8,
                      fontSize:14,
                      fontWeight:600,
                      cursor:'pointer',
                      transition:'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = '#B8921F';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = '#C9A227';
                      }
                    }}
                  >
                    {copied 
                      ? (lang === 'en' ? '✓ Copied' : '✓ Kopyalandı')
                      : (lang === 'en' ? 'Copy' : 'Kopyala')}
                  </button>
                </div>
              ) : (
                <p style={{color:'var(--muted)', fontSize:14}}>
                  {lang === 'en' ? 'Referral code not found' : 'Referans kodu bulunamadı'}
                </p>
              )}
              <p style={{marginTop:12, fontSize:12, color:'#666', lineHeight:1.5}}>
                {lang === 'en' 
                  ? 'Share this code to invite new users. Earn bonus NOP for each referral!'
                  : 'Bu kodu paylaşarak yeni kullanıcıları davet edin. Her referans için bonus NOP kazanın!'}
              </p>
            </div>
          </section>

          <Rightbar />
        </div>
      </main>
    </>
  );
}
