// 📁 pages/notifications.jsx
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import NotificationItem from '../components/NotificationItem';
import { getNotifications, clearNotifications } from '../utils/store';

export default function Notifications(){
  const list = getNotifications();

  return (
    <>
      <Navbar />
      <main className="container" style={{padding:'16px 0'}}>
        <div className="grid">
          <Sidebar />
          <section className="card" style={{padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h2 style={{margin:0}}>Bildirimler</h2>
              <button className="btn" onClick={()=>{ clearNotifications(); location.reload(); }}>
                Tümünü okundu yap
              </button>
            </div>
            <div style={{marginTop:8}}>
              {list.length===0 ? <p style={{color:'var(--muted)'}}>Bildirim yok.</p> :
                list.map(n => <NotificationItem key={n.id} n={n} />)
              }
            </div>
          </section>
          <Rightbar />
        </div>
      </main>
    </>
  );
}
