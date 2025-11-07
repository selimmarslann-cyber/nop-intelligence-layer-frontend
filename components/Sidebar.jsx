// 📁 components/Sidebar.jsx
// Sol navigasyon - Modern toolbar tasarımı
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import BoostedEvents from './BoostedEvents';
import TopGainers from './TopGainers';

// Menü öğeleri - mevcut sıralama ve isimler korunuyor, bildirim sayıları dinamik
const menuItems = [
  { href: '/', label: 'Home', icon: '●', activeKey: 'home', badge: null },
  { href: '/explore', label: 'Explore', icon: '📄', activeKey: 'explore', badge: null },
  { href: '/scores', label: 'Scores', icon: '#', activeKey: 'scores', badge: null },
  { href: '/wallet', label: 'Wallet (UI)', icon: '💼', activeKey: 'wallet', badge: null },
  { href: '/profile/me', label: 'Profile', icon: '👤', activeKey: 'profile', badge: null },
  { href: '/settings', label: 'Settings', icon: '⚙️', activeKey: 'settings', badge: null },
];

function NavItem({ href, label, icon, active, badge }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 8,
        textDecoration: 'none',
        color: active ? '#1E2328' : '#666',
        fontWeight: active ? 700 : 400,
        fontSize: 14,
        background: active ? '#FFE082' : 'transparent',
        transition: 'all 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#F5F5F5';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize: active ? 16 : 14,
          color: active ? '#C9A227' : '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
        }}
      >
        {active ? (
          <span style={{ color: '#C9A227', fontSize: 12 }}>●</span>
        ) : (
          <span>{icon}</span>
        )}
      </span>

      {/* Label */}
      <span style={{ flex: 1 }}>{label}</span>

      {/* Badge - bildirim sayısı varsa göster */}
      {badge !== null && badge !== undefined && badge > 0 && (
        <span
          style={{
            background: '#FF0000',
            color: '#fff',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            minWidth: 20,
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ active: propActive }) {
  const router = useRouter();
  // Bildirim sayıları - dinamik olarak güncellenebilir
  const [notifications, setNotifications] = useState({});

  // Aktif sayfayı pathname'e göre belirle
  const getActiveKey = () => {
    if (propActive) return propActive;
    if (!router || !router.pathname) return 'home';
    const pathname = router.pathname;
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/explore')) return 'explore';
    if (pathname.startsWith('/scores')) return 'scores';
    if (pathname.startsWith('/wallet')) return 'wallet';
    if (pathname.startsWith('/profile')) return 'profile';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'home';
  };

  const active = getActiveKey();

  // Bildirim sayılarını güncelle (API'den çekilebilir veya event listener ile güncellenebilir)
  useEffect(() => {
    // Örnek: API'den bildirim sayılarını çek
    // const fetchNotifications = async () => {
    //   try {
    //     const res = await fetch('/api/notifications/count');
    //     const data = await res.json();
    //     setNotifications(data);
    //   } catch (err) {
    //     console.error('Failed to fetch notifications:', err);
    //   }
    // };
    // fetchNotifications();
    
    // Event listener ile bildirim sayılarını güncelle
    const handleNotificationUpdate = (event) => {
      if (event.detail && event.detail.type && event.detail.count !== undefined) {
        setNotifications(prev => ({
          ...prev,
          [event.detail.type]: event.detail.count
        }));
      }
    };

    window.addEventListener('notification-update', handleNotificationUpdate);
    
    // Örnek: Her 30 saniyede bir güncelle
    // const interval = setInterval(fetchNotifications, 30000);
    
    return () => {
      window.removeEventListener('notification-update', handleNotificationUpdate);
      // clearInterval(interval);
    };
  }, []);

  return (
    <aside>
      {/* Ana Navigasyon Kartı */}
      <nav
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '20px 16px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >

        {/* Menü Öğeleri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active === item.activeKey}
              badge={item.badge !== null ? (notifications[item.activeKey] || item.badge) : (notifications[item.activeKey] || null)}
            />
          ))}
        </div>

        {/* Alt Buton */}
        <button
          style={{
            marginTop: 20,
            width: '100%',
            padding: '12px 16px',
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: '#1E2328',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
          onClick={() => {
            // Katkı gönderme modalını aç
            window.dispatchEvent(new CustomEvent('open-contribution-composer'));
          }}
        >
          <span style={{ fontSize: 18 }}>+</span>
          <span>Katkı Gönder</span>
        </button>
      </nav>

      {/* Diğer Kartlar */}
      <BoostedEvents />
      <TopGainers />

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Bugün Özeti</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Stat label="Günlük Puan" value="85" />
          <Stat label="Haftalık Tahmin" value="120 NOP" />
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>AI İpucu</div>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          Uzun ve referanslı katkılar daha yüksek etki skoru getirir.
        </p>
      </div>
    </aside>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}
