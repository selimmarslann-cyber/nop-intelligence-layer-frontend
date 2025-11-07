'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

type MarketData = {
  active_cryptocurrencies: number;
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_change_percentage_24h_usd: number;
};

type CoinData = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
};

// Simple SVG Sparkline Component
function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length === 0) return null;

  const width = 60;
  const height = 20;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const color = isPositive ? '#00AA00' : '#FF0000';

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MarketTicker() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [topCoins, setTopCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMarketData() {
    try {
      // Fetch global market data
      const globalRes = await axios.get('https://api.coingecko.com/api/v3/global');
      const globalData = globalRes.data.data;
      setMarketData({
        active_cryptocurrencies: globalData.active_cryptocurrencies || 0,
        total_market_cap: globalData.total_market_cap || { usd: 0 },
        total_volume: globalData.total_volume || { usd: 0 },
        market_cap_change_percentage_24h_usd: globalData.market_cap_change_percentage_24h_usd || 0,
      });

      // Fetch top 3 coins with sparkline data
      const coinsRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 3,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h',
        },
      });
      setTopCoins(coinsRes.data || []);
    } catch (err) {
      console.error('Market data fetch failed:', err);
      // Fallback data
      setMarketData({
        active_cryptocurrencies: 27940,
        total_market_cap: { usd: 3647080000000 },
        total_volume: { usd: 167630000000 },
        market_cap_change_percentage_24h_usd: -1.82,
      });
      setTopCoins([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || !marketData) {
    return (
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Kripto Paralar</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E2328', fontFamily: 'monospace' }}>...</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Piyasa değeri</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E2328', fontFamily: 'monospace' }}>...</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>24S Değişim</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E2328', fontFamily: 'monospace' }}>...</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>24S Hacim</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E2328', fontFamily: 'monospace' }}>...</div>
          </div>
        </div>
      </div>
    );
  }

  const coins = marketData.active_cryptocurrencies || 27940;
  const mcap = marketData.total_market_cap?.usd || 0;
  const volume = marketData.total_volume?.usd || 0;
  const change24h = marketData.market_cap_change_percentage_24h_usd || 0;
  
  // Format market cap (like $3.647,08 B USD)
  const mcapBillions = mcap / 1e9;
  const mcapFormatted = `$${mcapBillions.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} B USD`;
  
  // Format volume (like $167,63 B)
  const volumeBillions = volume / 1e9;
  const volumeFormatted = `$${volumeBillions.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} B`;
  
  // Format change (like -1,82%)
  const changeFormatted = change24h >= 0
    ? `+${change24h.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
    : `${change24h.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  
  const changeColor = change24h >= 0 ? '#00AA00' : '#FF0000';

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      padding: '12px 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1320,
        margin: '0 auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 24,
        alignItems: 'center',
      }}>
        {/* Kripto Paralar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Kripto Paralar</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E2328', fontFamily: 'monospace' }}>
              {coins.toLocaleString('tr-TR')}
            </div>
          </div>
          {topCoins.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {topCoins.slice(0, 2).map((coin) => (
                <div key={coin.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkline
                    data={coin.sparkline_in_7d?.price?.slice(-7) || []}
                    isPositive={coin.price_change_percentage_24h >= 0}
                  />
                  <span style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>
                    {coin.symbol.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Piyasa değeri */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Piyasa değeri</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E2328', fontFamily: 'monospace' }}>
              {mcapFormatted}
            </div>
          </div>
          {topCoins.length > 0 && topCoins[0] && (
            <Sparkline
              data={topCoins[0].sparkline_in_7d?.price?.slice(-7) || []}
              isPositive={topCoins[0].price_change_percentage_24h >= 0}
            />
          )}
        </div>

        {/* 24S Değişim */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>24S Değişim</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: changeColor, fontFamily: 'monospace' }}>
              {changeFormatted}
            </div>
          </div>
          {topCoins.length > 0 && topCoins[1] && (
            <Sparkline
              data={topCoins[1].sparkline_in_7d?.price?.slice(-7) || []}
              isPositive={topCoins[1].price_change_percentage_24h >= 0}
            />
          )}
        </div>

        {/* 24S Hacim */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>24S Hacim</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E2328', fontFamily: 'monospace' }}>
              {volumeFormatted}
            </div>
          </div>
          {topCoins.length > 0 && topCoins[2] && (
            <Sparkline
              data={topCoins[2].sparkline_in_7d?.price?.slice(-7) || []}
              isPositive={topCoins[2].price_change_percentage_24h >= 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
