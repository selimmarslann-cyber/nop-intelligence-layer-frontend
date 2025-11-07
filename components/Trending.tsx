import { useEffect, useState } from "react";
import { card, sectionTitle } from "./layout";
import { getApiBase } from "../src/lib/api";
export default function Trending(){
  const [tags, setTags] = useState<string[]>([]);
  useEffect(()=>{
    (async()=>{ try{ const r=await fetch(`${getApiBase()}/api/trending?limit=12`); const d=await r.json(); setTags(d?.tags||[]);}catch{} })();
  },[]);
  return (
    <div style={{...card, padding:12}}>
      <div style={sectionTitle}>Trend Hashtagler</div>
      <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        {tags.map(t=><span key={t} style={{fontSize:13, background:"#f6f6f6", border:"1px solid #eee", borderRadius:999, padding:"6px 10px"}}>#{t}</span>)}
      </div>
    </div>
  );
}
