/**
 * UI Enhancement utilities for homepage
 * Runs client-side only to enhance UI elements
 */
'use client';

export function enhanceHomeUI() {
  if (typeof window === 'undefined') return;

  // 1. Hide "Haftanın En Katkılı 10 Kullanıcısı" card
  const hideWeeklyTopCard = () => {
    document.querySelectorAll('h2, h3').forEach((h: any) => {
      const text = (h.textContent || '').toLowerCase();
      if (text.includes('haftanın en katkılı 10 kullanıcısı') || 
          text.includes('haftanın en katkılı') ||
          text.includes('top 10 kullanıcı')) {
        const card = h.closest('section, div, article, [class*="card"]');
        if (card) {
          (card as HTMLElement).style.display = 'none';
        }
      }
    });
  };

  // 2. Trend Kullanıcılar: Add medals to first 3
  const addMedalsToTrendUsers = () => {
    const trendHeader = Array.from(document.querySelectorAll('h2, h3')).find(h =>
      (h.textContent || '').toLowerCase().includes('trend kullanıcılar') ||
      (h.textContent || '').toLowerCase().includes('trend users')
    );

    if (trendHeader) {
      const list = trendHeader.parentElement?.querySelector('ul, ol, div[class*="list"], div[class*="users"]');
      if (list) {
        const rows = Array.from(list.children).slice(0, 3);
        const medals = ['🥇', '🥈', '🥉'];
        
        rows.forEach((el, i) => {
          if (!el.querySelector('._medal')) {
            const span = document.createElement('span');
            span.className = '_medal';
            span.style.marginLeft = '8px';
            span.style.fontSize = '18px';
            span.textContent = medals[i];
            
            const firstChild = el.firstElementChild;
            if (firstChild) {
              firstChild.appendChild(span);
            } else {
              el.insertBefore(span, el.firstChild);
            }
          }
        });
      }
    }
  };

  // 3. Top Gainers: Add demo data if empty
  const addDemoTopGainers = () => {
    const gainersHeader = Array.from(document.querySelectorAll('h2, h3')).find(h =>
      (h.textContent || '').toLowerCase().includes('top gainers') ||
      (h.textContent || '').toLowerCase().includes('top kazananlar')
    );

    if (gainersHeader) {
      const box = gainersHeader.parentElement as HTMLElement;
      const hasRows = !!box.querySelector('li, .row, table tr, [data-item], [class*="item"]');
      
      if (!hasRows) {
        // Check if demo already added
        if (box.querySelector('._demo-gainers')) return;
        
        const demo = document.createElement('div');
        demo.className = '_demo-gainers';
        demo.innerHTML = `
          <ul style="list-style:none;padding-left:0;margin-top:8px;color:#1E2328">
            <li style="padding:8px 0;border-bottom:1px solid #eee">🚀 <b>COINX</b> <span style="color:#00AA00;margin-left:8px">+18.4%</span></li>
            <li style="padding:8px 0;border-bottom:1px solid #eee">🚀 <b>ALPHA</b> <span style="color:#00AA00;margin-left:8px">+12.1%</span></li>
            <li style="padding:8px 0;border-bottom:1px solid #eee">🚀 <b>ZEN</b> <span style="color:#00AA00;margin-left:8px">+9.7%</span></li>
          </ul>
        `;
        box.appendChild(demo);
      }
    }
  };

  // 4. Boosted Events: Add celebration theme
  const enhanceEvents = () => {
    const evtHeader = Array.from(document.querySelectorAll('h2, h3')).find(h => {
      const text = (h.textContent || '').toLowerCase();
      return text.includes('boosted events') ||
             text.includes('events') ||
             text.includes('etkinlik') ||
             text.includes('boosted');
    });

    if (evtHeader) {
      const cards = evtHeader.parentElement?.querySelectorAll('div, article, section');
      cards?.forEach((c, i) => {
        const card = c as HTMLElement;
        
        // Skip if already enhanced
        if (card.querySelector('._cele')) return;
        
        card.style.borderRadius = '12px';
        card.style.border = '1px solid #E5E7EB';
        card.style.background = 'linear-gradient(90deg, #F8FAFC 0%, #FFFBE6 60%, #F8FAFC 100%)';
        card.style.padding = '12px';
        card.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        
        const badge = document.createElement('span');
        badge.className = '_cele';
        badge.textContent = i % 2 === 0 ? '🎉' : '🏆';
        badge.style.marginRight = '8px';
        badge.style.fontSize = '18px';
        
        if (c.firstChild) {
          c.insertBefore(badge, c.firstChild);
        } else {
          c.appendChild(badge);
        }
      });
    }
  };

  // Run all enhancements
  hideWeeklyTopCard();
  addMedalsToTrendUsers();
  addDemoTopGainers();
  enhanceEvents();
}

