// components/TopGainers.tsx
import { useEffect, useState } from "react";
import { API_URL } from "../src/lib/api";

type Gainer = {
  symbol: string;
  pct: number;
  sparkline?: number[]; // Array of price points for sparkline
};

export default function TopGainers() {
  const [list, setList] = useState<Gainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopGainers() {
      try {
          const url = `${API_URL}/api/top-gainers`;
        console.log('[TopGainers] Fetching from:', url);
        
        const r = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('[TopGainers] Response status:', r.status, r.statusText);
        
        if (!r.ok) {
          const errorText = await r.text();
          console.error('[TopGainers] Error response:', errorText);
          throw new Error(`Failed to fetch top gainers: ${r.status} ${r.statusText}`);
        }
        
        const d = await r.json();
        console.log('[TopGainers] Data received:', d);
        
        if (d?.ok && d?.list) {
          setList(d.list);
        } else if (d?.list) {
          setList(d.list);
        } else {
          console.warn('[TopGainers] Unexpected data format:', d);
          setList([]);
        }
      } catch (e: any) {
        console.error("[TopGainers] Failed to load top gainers:", e);
        // Fallback to empty array
        setList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTopGainers();
    // Auto-refresh every 5 minutes (matching backend cache)
    const interval = setInterval(fetchTopGainers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cardStyle = {
    background: "#F8FAFC",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  };

  const sectionTitleStyle = {
    fontWeight: 700,
    fontSize: 16,
    margin: "0 0 12px 0",
    color: "#1E2328",
  };

  if (loading) {
    return (
      <div className="card" style={cardStyle}>
        <div style={sectionTitleStyle}>Top Gainers</div>
        <div style={{ color: "#999", fontSize: 13, padding: "8px 0" }}>Loading...</div>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="card" style={cardStyle}>
        <div style={sectionTitleStyle}>Top Gainers</div>
        <div style={{ color: "#999", fontSize: 13, padding: "8px 0" }}>No data available</div>
      </div>
    );
  }

  return (
    <div className="card" style={cardStyle}>
      <div style={sectionTitleStyle}>Top Gainers</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((g, i) => (
          <GainerItem key={i} gainer={g} />
        ))}
      </div>
    </div>
  );
}

function GainerItem({ gainer }: { gainer: Gainer }) {
  const isPositive = gainer.pct >= 0;
  const color = isPositive ? "#0c7b3c" : "#b30000";

  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#1E2328" }}>${gainer.symbol}</div>
        <div style={{ color, fontSize: 13, fontWeight: 600 }}>
          {isPositive ? "+" : ""}
          {gainer.pct.toFixed(2)}%
        </div>
      </div>
      {gainer.sparkline && gainer.sparkline.length > 0 && (
        <div style={{ width: 60, height: 30 }}>
          <Sparkline data={gainer.sparkline} isPositive={isPositive} />
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (data.length < 2) return null;

  const width = 60;
  const height = 30;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Normalize data to fit chart dimensions
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path
        d={pathData}
        fill="none"
        stroke={isPositive ? "#0c7b3c" : "#b30000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Fill area under the line */}
      <path
        d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
        fill={isPositive ? "#0c7b3c" : "#b30000"}
        fillOpacity="0.1"
      />
    </svg>
  );
}
