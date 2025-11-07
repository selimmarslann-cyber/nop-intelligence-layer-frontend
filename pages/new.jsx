// 📁 pages/new.jsx
// Yeni katkı gönder — mock store'a ekle, sonra detail sayfasına yönlendir.
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import { addPost } from '../utils/store';

export default function NewContribution(){
  const r = useRouter();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('AI, Blockchain');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  function handleSubmit(e){
    e.preventDefault();
    if(!title.trim()) return alert('Başlık zorunlu');
    const tagArr = tags.split(',').map(s=>s.trim()).filter(Boolean);
    const post = addPost({ title, tags: tagArr, summary, content, image });
    alert('Gönderi oluşturuldu');
    r.push(`/contribution/${post.id}`);
  }

  return (
    <>
      <Navbar />
      <main className="container" style={{padding:'16px 0'}}>
        <div className="grid">
          <Sidebar active="new" />

          <section className="card" style={{padding:16}}>
            <h2 style={{marginTop:0}}>Yeni Katkı</h2>
            <form onSubmit={handleSubmit} style={{display:'grid', gap:12}}>
              <input
                placeholder="Başlık"
                value={title} onChange={e=>setTitle(e.target.value)}
                style={{height:44, padding:'0 12px', border:'1px solid var(--border)', borderRadius:10, outlineColor:'var(--blue)'}}
              />
              <input
                placeholder="Etiketler (virgülle ayır: AI, Blockchain)"
                value={tags} onChange={e=>setTags(e.target.value)}
                style={{height:44, padding:'0 12px', border:'1px solid var(--border)', borderRadius:10}}
              />
              <input
                placeholder="Görsel URL (opsiyonel)"
                value={image} onChange={e=>setImage(e.target.value)}
                style={{height:44, padding:'0 12px', border:'1px solid var(--border)', borderRadius:10}}
              />
              <textarea
                placeholder="Özet (2-3 cümle)"
                value={summary} onChange={e=>setSummary(e.target.value)}
                rows={3}
                style={{padding:'8px 12px', border:'1px solid var(--border)', borderRadius:10}}
              />
              <textarea
                placeholder="İçerik (Markdown destekli – şimdilik düz metin)"
                value={content} onChange={e=>setContent(e.target.value)}
                rows={10}
                style={{padding:'8px 12px', border:'1px solid var(--border)', borderRadius:10}}
              />
              <div style={{display:'flex', gap:8}}>
                <button type="submit" className="btn btn-blue">Submit</button>
                <button type="button" className="btn" onClick={()=>alert('Taslak kaydet (mock)')}>
                  Taslak Kaydet
                </button>
              </div>
            </form>
          </section>

          <Rightbar />
        </div>
      </main>
    </>
  );
}
