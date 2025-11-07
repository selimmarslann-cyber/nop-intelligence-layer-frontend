'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiBase } from '../src/lib/api';

type NewsItem = { title: string; url: string; image?: string; source?: string; publishedAt?: string; };

export default function NewsPanel({ limit = 4 }: { limit?: number }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get(`${getApiBase()}/api/news`, { params: { limit } });
      setNews(res.data?.items || []);
    } catch (e) {
      console.error('NEWS_FETCH_ERROR', e);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60 * 60 * 1000); // her saat başı güncelle
    return () => clearInterval(id);
  }, [limit]);

  if (loading && news.length === 0) return <div style={{fontSize:12,opacity:.6}}>Haberler yükleniyor…</div>;
  if (news.length === 0) return <div style={{fontSize:12,opacity:.6}}>Bugün için haber bulunamadı.</div>;

  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12}}>
      {news.slice(0, limit).map((n, i) => (
        <a key={i} href={n.url} target="_blank" rel="noreferrer"
           style={{textDecoration:'none', color:'inherit', border:'1px solid #eee', borderRadius:10, overflow:'hidden', background:'#fff'}}>
          {n.image && (
            <div style={{aspectRatio:'16/9', background:'#f5f5f5'}}>
              <img src={n.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
          )}
          <div style={{padding:12}}>
            <div style={{fontSize:13,fontWeight:600,lineHeight:1.3,marginBottom:6}}>{n.title}</div>
            <div style={{fontSize:11,color:'#666',display:'flex',justifyContent:'space-between'}}>
              <span>{n.source || 'News'}</span>
              {n.publishedAt && <span>{new Date(n.publishedAt).toLocaleDateString()}</span>}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

