import { useEffect, useState } from "react";
import { card, sectionTitle } from "./layout";
import { getApiBase } from "../src/lib/api";
type News = { title:string; link:string; source:string; isoDate?:string };

export default function NewsList(){
  const [items,setItems] = useState<News[]>([]);
  useEffect(()=>{
    (async()=>{
      try{ const r=await fetch(`${getApiBase()}/api/news?limit=12`); const d=await r.json(); setItems(d?.items||[]); }catch{}
    })();
  },[]);
  return (
    <div style={{...card, padding:12}}>
      <div style={sectionTitle}>Haberler</div>
      <div style={{display:"flex", flexDirection:"column", gap:8, maxHeight:520, overflow:"auto"}}>
        {items.map((n,i)=>(
          <a key={i} href={n.link} target="_blank" rel="noreferrer"
             style={{fontSize:14, color:"#0a0a0a", textDecoration:"none"}}>
            • {n.title} <span style={{color:"#888", fontSize:12}}>({n.source})</span>
          </a>
        ))}
      </div>
    </div>
  );
}
