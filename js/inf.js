/* ============================================================
   LA JOYA · INF — inicialización final + extras
   Depende de: window.LJ (core + commerce + app)
   ============================================================ */
(function(){
  "use strict";
  const { $, $$, toast, openModal, closeAllModals } = window.LJ;

  /* ---------- HERO AI BUTTON ---------- */
  function wireHeroAI(){
    const btn = $('#heroAI'); if(!btn) return;
    btn.addEventListener('click',()=>{
      // Already wired by chat-open data-action, but ensure panel opens
    });
  }

  /* ---------- LAZY-LOAD FALLBACK IMAGES ---------- */
  function initImageFallback(){
    document.querySelectorAll('img').forEach(img=>{
      img.addEventListener('error',()=>{
        if(!img.dataset.fb){
          img.dataset.fb = '1';
          img.src = 'https://picsum.photos/seed/lj-fallback/600/400.jpg';
        }
      });
    });
  }

  /* ---------- ALL CATS POPOVER ---------- */
  function initAllCats(){
    const list = $('#allCatsList'); if(!list) return;
    list.innerHTML = window.LJ.DATA.categorias.map(c=>`
      <button class="pop-item" data-action="goto-cat" data-cat="${c.id}">
        <span style="font-size:1.2rem">${c.icon}</span>
        <span>${window.LJ.esc(c.nombre)}</span>
      </button>
    `).join('');
    list.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="goto-cat"]'); if(!b) return;
      const cat = b.dataset.cat;
      const chip = document.querySelector(`#catChips [data-cat="${cat}"]`);
      if(chip){ chip.click(); document.getElementById('catalogo').scrollIntoView({behavior:'smooth'}); }
      $('#allCatsPop')?.classList.remove('show');
    });
  }

  /* ---------- FOOTER LINKS ---------- */
  function initFooterLinks(){
    document.addEventListener('click',(e)=>{
      const a = e.target.closest('footer .f-col a[href^="#"]');
      if(!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if(target){ target.scrollIntoView({behavior:'smooth'}); e.preventDefault(); }
    });
  }

  /* ---------- PREVENT DEFAULT FOR # LINKS ---------- */
  function initHashLinks(){
    $$('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',(e)=>{
        const href = a.getAttribute('href');
        if(href.length<=1) return;
        const target = document.querySelector(href);
        if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
      });
    });
  }

  /* ---------- ESC TO CLOSE EVERYTHING ---------- */
  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'){
      $('#mobileMenu')?.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  });

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded',()=>{
    wireHeroAI();
    initImageFallback();
    initAllCats();
    initFooterLinks();
    initHashLinks();
    // Final UI refresh after everything is wired
    setTimeout(()=>{
      window.LJ.commerce?.renderCatalog();
      window.LJ.commerce?.renderCartMini();
      window.LJ.commerce?.renderDirectory();
      window.LJ.commerce?.renderJobs();
    },100);
    // Re-invalidate map on resize
    window.addEventListener('resize',()=>{
      const map = window.LJ.getMap?.();
      if(map) setTimeout(()=>map.invalidateSize(),200);
    });
    // Welcome toast
    setTimeout(()=>{
      toast('Bienvenido al portal de La Joya · Arequipa, Perú','ok');
    },1500);
  });

  // Console badge
  console.log('%cLA JOYA','color:#C25A2B;font-family:Fraunces,serif;font-size:32px;font-weight:700');
  console.log('%cPortal del distrito · modo demostración','color:#6E6450;font-size:12px');
})();
