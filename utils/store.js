// 📁 utils/store.js
// Amaç: Backend gelene kadar post/veri akışını tek noktadan yönetmek.
// Not: Sayfalar arası gezintide veriler korunur (module scope). Refresh'te sıfırlanır.

const now = (h=0) => {
  const d = new Date(Date.now() - h*60*60*1000);
  const diffH = Math.max(1, Math.round((Date.now()-d)/36e5));
  return diffH <= 24 ? `${diffH}h` : `${Math.floor(diffH/24)}d`;
};

let POSTS = [
  {
    id:'c-101',
    user:'sarahwong',
    time: now(2),
    title:'Introduction to Quantum Computing',
    tags:['Quantum','Education'],
    image:'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop',
    summary:'In this guide, I provide an overview of the basic concepts of quantum computing, including qubits, superposition, and entanglement.',
    content:`## Introduction

Quantum computers leverage superposition and entanglement to solve certain problems more efficiently than classical computers.

- Qubit
- Superposition
- Entanglement

> This is a mock detail. Backend bağlandıktan sonra markdown içerik buraya gelecek.`,
    score:82, likes:18, comments:5
  },
  {
    id:'c-102',
    user:'altinoran',
    time: now(5),
    title:'zkRollup ile Ölçeklenebilirlik',
    tags:['Blockchain','zk'],
    image:'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1200&auto=format&fit=crop',
    summary:'zkSync Era sayesinde ücretler düşer, güvenlik Ethereum’dan devralınır. Temel kavramlar ve tasarım notları.',
    content:`zkRollup modeli, state root'ları L1'e yazar. Bu sayede güvenlik Ethereum'dan devralınır.`,
    score:75, likes:42, comments:12
  },
  {
    id:'c-103',
    user:'aegean',
    time: now(24),
    title:'Transfer Learning Uygulamaları',
    tags:['AI','models'],
    image:'https://images.unsplash.com/photo-1558507334-57300f59f0b7?q=80&w=1200&auto=format&fit=crop',
    summary:'Önceden eğitilmiş modeller farklı görevlerde yeniden kullanılarak veri ve süre tasarrufu sağlar.',
    content:`ResNet, BERT gibi modellerden fine-tune stratejileri.`,
    score:68, likes:31, comments:9
  }
];

export function getPosts() { return POSTS.slice().reverse(); } // yeniler üstte
export function getPostById(id){ return POSTS.find(p=>p.id===id) || null; }

export function addPost({title, tags, summary, content, image, user='you'}){
  const id = 'c-' + Date.now();
  const post = {
    id, user, time:'now', title,
    tags: (tags||[]).filter(Boolean),
    image: image || '',
    summary: summary || '',
    content: content || summary || '',
    score: Math.min(95, Math.max(40, Math.round(60 + Math.random()*30))),
    likes:0, comments:0
  };
  POSTS = [...POSTS, post];
  return post;
}

export function searchPosts({q='', tag=''}) {
  const qq = q.trim().toLowerCase();
  const tt = (tag||'').toLowerCase().replace('#','');
  return getPosts().filter(p=>{
    const hitQ = !qq || [p.title, p.summary, p.user, ...(p.tags||[])].join(' ').toLowerCase().includes(qq);
    const hitT = !tt || (p.tags||[]).some(t => t.toLowerCase()===tt);
    return hitQ && hitT;
  });
}

export function recentPosts(limit=6){ return getPosts().slice(0, limit); }

export function trendingUsers(){
  const map = new Map();
  POSTS.forEach(p => map.set(p.user, (map.get(p.user)||0) + p.score));
  return [...map.entries()]
    .map(([handle,score])=>({handle,score: Math.min(99, Math.round(score/3))}))
    .sort((a,b)=>b.score-a.score)
    .slice(0,5);
}
// ——— FAZ3 EKLERİ ———

// Basit kullanıcı profilleri (mock)
const USERS = {
  'you': { handle:'you', name:'Selim Arslan', avatar:'', bio:'Building NOP Intelligence Layer.', totalScore: 1234, badges:['Founder','Early'], following:['sarahwong','aegean'] },
  'sarahwong': { handle:'sarahwong', name:'Sarah Wong', avatar:'', bio:'Research & writing.', totalScore: 980, badges:['Researcher'], following:[] },
  'aegean': { handle:'aegean', name:'Aegean', avatar:'', bio:'AI/Blockchain notes.', totalScore: 860, badges:['Top 10'], following:[] },
  'altinoran': { handle:'altinoran', name:'Altın Oran', avatar:'', bio:'Architecture & design.', totalScore: 740, badges:['Creator'], following:[] },
};

let SAVED = [];   // {postId}
let DRAFTS = [];  // {id,title,tags,summary,content,image}
let NOTIFS = [
  { id:'n1', type:'like',    who:'sarahwong',  postId:'c-102', ts:'2h' },
  { id:'n2', type:'comment', who:'aegean',     postId:'c-101', ts:'5h', text:'Harika özet!' },
  { id:'n3', type:'follow',  who:'altinoran',  postId:null,    ts:'1d' },
];

export function getUser(handle='you'){ return USERS[handle] || {handle, name:handle, totalScore:0, badges:[], following:[], bio:''}; }
export function getUserPosts(handle){ return getPosts().filter(p=>p.user===handle); }
export function getSaved(){ return SAVED.map(id=>getPostById(id)).filter(Boolean); }
export function getDrafts(){ return DRAFTS.slice().reverse(); }
export function savePost(id){ if(!SAVED.includes(id)) SAVED.push(id); return SAVED; }
export function addDraft(d){ const id='d-'+Date.now(); DRAFTS=[...DRAFTS,{ id, ...d }]; return id; }

export function getNotifications(){ return NOTIFS.slice().reverse(); }
export function clearNotifications(){ NOTIFS = []; }
