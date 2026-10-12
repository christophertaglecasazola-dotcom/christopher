/* ============================================================
   LA JOYA · COMMERCE — catálogo, filtros, carrito, checkout
   Depende de: window.LJ (core)
   ============================================================ */
(function(){
  "use strict";
  const { DATA, store, $, $$, money, esc, star, fmt, toast, openModal, closeModal, confirm } = window.LJ;

  /* ---------- STATE ---------- */
  const state = {
    cat: 'todo',
    sort: 'rel',
    rating: 0,
    zone: 'todo',
    minPrice: null,
    maxPrice: null,
    onlyOffer: false,
    onlyAvail: false,
    query: ''
  };

  /* ---------- CATÁLOGO ---------- */
  function getFilteredProducts(){
    let list = DATA.productos.slice();
    if(state.cat !== 'todo') list = list.filter(p=>p.cat===state.cat);
    if(state.query){
      const q = state.query.toLowerCase();
      list = list.filter(p=>(p.nombre+' '+p.negocio+' '+p.cat).toLowerCase().includes(q));
    }
    if(state.rating>0) list = list.filter(p=>p.rating>=state.rating);
    if(state.zone!=='todo') list = list.filter(p=>p.zona===state.zone);
    if(state.minPrice!=null) list = list.filter(p=>p.precio>=state.minPrice);
    if(state.maxPrice!=null) list = list.filter(p=>p.precio<=state.maxPrice);
    if(state.onlyOffer) list = list.filter(p=>p.oferta);
    if(state.onlyAvail) list = list.filter(p=>p.stock>0);
    switch(state.sort){
      case 'precio-asc': list.sort((a,b)=>a.precio-b.precio); break;
      case 'precio-desc': list.sort((a,b)=>b.precio-a.precio); break;
      case 'populares': list.sort((a,b)=>b.vendidos-a.vendidos); break;
      case 'calificacion': list.sort((a,b)=>b.rating-a.rating); break;
    }
    return list;
  }

  function renderCatalog(){
    const grid = $('#prodGrid');
    const empty = $('#prodEmpty');
    const count = $('#prodCount');
    if(!grid) return;
    const list = getFilteredProducts();
    if(count) count.textContent = list.length+' productos';
    if(list.length===0){
      grid.innerHTML=''; empty.hidden=false;
    }else{
      empty.hidden=true;
      const favs = store.get('favs',[]);
      grid.innerHTML = list.map(p=>{
        const fav = favs.includes(p.id) ? 'on' : '';
        const tag = p.oferta ? '<span class="prod-tag offer">Oferta</span>' : (p.vendidos>400?'<span class="prod-tag new">Top</span>':'');
        const price = p.oferta ? `<small>${money(p.precioOld)}</small>${money(p.precio)}` : money(p.precio);
        const stock = p.stock>0 ? `<button class="prod-add" data-action="add-cart" data-id="${p.id}" aria-label="Agregar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button>`
                                : '<span class="prod-stock-out">Agotado</span>';
        return `
          <article class="prod-card">
            <div class="prod-img">
              <img src="${p.img}" alt="${esc(p.nombre)}" loading="lazy">
              ${tag}
              <button class="prod-fav ${fav}" data-action="fav-toggle" data-id="${p.id}" aria-label="Favorito">
                <svg viewBox="0 0 24 24" fill="${fav?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </button>
            </div>
            <div class="prod-body">
              <span class="prod-cat">${esc(p.cat)}</span>
              <span class="prod-name">${esc(p.nombre)}</span>
              <span class="prod-shop">${esc(p.negocio)}</span>
              <span class="prod-rating">${star(p.rating)} <span>(${p.vendidos})</span></span>
              <div class="prod-foot">
                <span class="prod-price">${price}</span>
                ${stock}
              </div>
            </div>
          </article>
        `;
      }).join('');
    }
  }

  /* ---------- CATEGORY CHIPS ---------- */
  function renderCatChips(){
    const row = $('#catChips'); if(!row) return;
    const cats = [{id:'todo',nombre:'Todo',icon:''}].concat(DATA.categorias);
    // Only show the most relevant for catalog
    const list = [
      {id:'todo',nombre:'Todo'},
      {id:'comida',nombre:'Comida'},
      {id:'mercados',nombre:'Mercados'},
      {id:'agricola',nombre:'Agrícola'},
      {id:'servicios',nombre:'Servicios'},
      {id:'salud',nombre:'Salud'},
      {id:'turismo',nombre:'Turismo'},
      {id:'ferreteria',nombre:'Ferretería'},
      {id:'moda',nombre:'Moda'},
      {id:'tech',nombre:'Tech'}
    ];
    row.innerHTML = list.map((c,i)=>`<button class="chip ${i===0?'on':''}" data-action="cat-chip" data-cat="${c.id}">${esc(c.nombre)}</button>`).join('');
    row.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="cat-chip"]'); if(!b) return;
      $$('button',row).forEach(x=>x.classList.remove('on'));
      b.classList.add('on');
      state.cat = b.dataset.cat;
      renderCatalog();
    });
    // Populate zone filter
    const fZone = $('#fZone'); if(fZone){
      const zones = Array.from(new Set(DATA.productos.map(p=>p.zona)));
      fZone.innerHTML = '<option value="todo">Toda La Joya</option>' + zones.map(z=>`<option value="${esc(z)}">${esc(z)}</option>`).join('');
    }
  }

  /* ---------- FILTERS ---------- */
  function initFilters(){
    const fSort = $('#fSort'); if(fSort) fSort.addEventListener('change',()=>{ state.sort=fSort.value; renderCatalog(); });
    const fRating = $('#fRating'); if(fRating) fRating.addEventListener('change',()=>{ state.rating=parseFloat(fRating.value); renderCatalog(); });
    const fZone = $('#fZone'); if(fZone) fZone.addEventListener('change',()=>{ state.zone=fZone.value; renderCatalog(); });
    const fMin = $('#fMin'); if(fMin) fMin.addEventListener('input',()=>{ state.minPrice = fMin.value?parseFloat(fMin.value):null; renderCatalog(); });
    const fMax = $('#fMax'); if(fMax) fMax.addEventListener('input',()=>{ state.maxPrice = fMax.value?parseFloat(fMax.value):null; renderCatalog(); });
    const fOffer = $('#fOffer'); if(fOffer) fOffer.addEventListener('click',()=>{ fOffer.classList.toggle('on'); state.onlyOffer=fOffer.classList.contains('on'); renderCatalog(); });
    const fAvail = $('#fAvail'); if(fAvail) fAvail.addEventListener('click',()=>{ fAvail.classList.toggle('on'); state.onlyAvail=fAvail.classList.contains('on'); renderCatalog(); });
    document.addEventListener('click',(e)=>{
      if(e.target.matches('[data-action="clear-filters"]')){
        state.cat='todo'; state.sort='rel'; state.rating=0; state.zone='todo';
        state.minPrice=null; state.maxPrice=null; state.onlyOffer=false; state.onlyAvail=false; state.query='';
        if(fSort) fSort.value='rel';
        if(fRating) fRating.value='0';
        if(fZone) fZone.value='todo';
        if(fMin) fMin.value='';
        if(fMax) fMax.value='';
        if(fOffer) fOffer.classList.remove('on');
        if(fAvail) fAvail.classList.remove('on');
        $$('[data-action="cat-chip"]').forEach(x=>x.classList.toggle('on', x.dataset.cat==='todo'));
        const echo = $('#qEcho'); if(echo){ echo.hidden=true; echo.innerHTML=''; }
        renderCatalog();
      }
    });
  }

  /* ---------- SEARCH (from header) ---------- */
  function search(q){
    state.query = q;
    const echo = $('#qEcho');
    if(q){ if(echo){ echo.hidden=false; echo.innerHTML='Resultados para "<b>'+esc(q)+'</b>"'; } }
    else { if(echo){ echo.hidden=true; } }
    renderCatalog();
    document.getElementById('catalogo').scrollIntoView({behavior:'smooth'});
  }

  /* ---------- PRODUCT MODAL ---------- */
  function openProduct(id){
    const p = DATA.productos.find(x=>x.id===id); if(!p) return;
    const biz = DATA.negocios.find(b=>b.nombre===p.negocio);
    const favs = store.get('favs',[]);
    const isFav = favs.includes(p.id);
    $('#mdProductBody').innerHTML = `
      <div class="pop-img"><img src="${p.img.replace('/600/600','/1000/440')}" alt="${esc(p.nombre)}"></div>
      <div class="m-form">
        <span class="label">${esc(p.cat)} · ${esc(p.zona)}</span>
        <h3>${esc(p.nombre)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="prod-rating" style="font-size:.92rem;margin:6px 0">${star(p.rating)} <span style="color:var(--ink-3);font-size:.8rem">· ${p.vendidos} vendidos</span></div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin:14px 0">
          <div>
            <span class="prod-price" style="font-size:1.6rem">${p.oferta?money(p.precio):''}</span>
            ${p.oferta?`<small style="display:block;text-decoration:line-through;color:var(--ink-3)">${money(p.precioOld)}</small>`:''}
            ${!p.oferta?`<span class="prod-price" style="font-size:1.6rem">${money(p.precio)}</span>`:''}
          </div>
          <span class="prod-stock-out" style="${p.stock>0?'color:var(--leaf)':''}">${p.stock>0?'Disponible · '+p.stock+' en stock':'Agotado'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin:8px 0 0">
          <label style="font-size:.8rem;color:var(--ink-3)">Cantidad</label>
          <input type="number" id="prodQty" class="field" value="1" min="1" max="${p.stock}" style="width:80px">
        </div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn btn-ghost" data-action="fav-toggle" data-id="${p.id}" style="flex:1;justify-content:center">
            <svg viewBox="0 0 24 24" fill="${isFav?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            ${isFav?'Quitar de favoritos':'A favoritos'}
          </button>
          <button class="btn btn-solid" data-action="add-cart-modal" data-id="${p.id}" style="flex:1;justify-content:center" ${p.stock<=0?'disabled':''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            Agregar al carrito
          </button>
        </div>
        ${biz?`<p style="font-size:.82rem;color:var(--ink-3);margin-top:14px">Vendido por <b style="color:var(--accent);cursor:pointer" data-action="open-business" data-id="${biz.id}">${esc(biz.nombre)}</b></p>`:''}
      </div>
    `;
    openModal('mdProduct');
  }

  /* ---------- CART ---------- */
  function getCart(){ return store.get('cart',[]); }
  function setCart(c){ store.set('cart',c); updateCartUI(); }
  function addToCart(id,qty=1){
    const p = DATA.productos.find(x=>x.id===id); if(!p || p.stock<=0){ toast('Producto agotado','err'); return; }
    const cart = getCart();
    const ex = cart.find(i=>i.id===id);
    if(ex) ex.qty = Math.min(ex.qty+qty, p.stock);
    else cart.push({id,qty:Math.min(qty,p.stock)});
    setCart(cart);
    toast('Agregado al carrito: '+p.nombre,'ok');
    renderCartMini(); renderCartFull();
  }
  function changeQty(id,delta){
    const cart = getCart();
    const item = cart.find(i=>i.id===id); if(!item) return;
    const p = DATA.productos.find(x=>x.id===id);
    item.qty = Math.max(0, Math.min(item.qty+delta, p.stock));
    if(item.qty===0) cart.splice(cart.indexOf(item),1);
    setCart(cart);
    renderCartMini(); renderCartFull();
  }
  function removeFromCart(id){
    const cart = getCart().filter(i=>i.id!==id);
    setCart(cart); renderCartMini(); renderCartFull();
    toast('Producto retirado del carrito','info');
  }
  function clearCart(){
    setCart([]); renderCartMini(); renderCartFull();
    toast('Carrito vaciado','info');
  }

  function cartSubtotal(){
    return getCart().reduce((s,i)=>{
      const p = DATA.productos.find(x=>x.id===i.id);
      return s + (p?p.precio*i.qty:0);
    },0);
  }
  function cartCount(){
    return getCart().reduce((s,i)=>s+i.qty,0);
  }

  function updateCartUI(){
    const cnt = $('#cartCount'); if(cnt) cnt.textContent = cartCount();
    const favCnt = $('#favCount'); if(favCnt) favCnt.textContent = store.get('favs',[]).length;
  }

  function renderCartMini(){
    const list = $('#cartMiniList');
    const sub = $('#cartMiniSub');
    if(!list) return;
    const cart = getCart();
    if(cart.length===0){
      list.innerHTML = '<p style="color:var(--ink-3);font-size:.82rem;padding:14px 0">Tu carrito está vacío.</p>';
    }else{
      list.innerHTML = cart.map(i=>{
        const p = DATA.productos.find(x=>x.id===i.id); if(!p) return '';
        return `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.82rem">
          <img src="${p.img}" alt="" style="width:36px;height:36px;border-radius:6px;object-fit:cover">
          <div style="flex:1"><b style="font-family:var(--ff-serif);display:block;font-size:.86rem">${esc(p.nombre)}</b><small style="color:var(--ink-3)">${i.qty} × ${money(p.precio)}</small></div>
          <b style="color:var(--accent);font-family:var(--ff-serif)">${money(p.precio*i.qty)}</b>
        </div>`;
      }).join('');
    }
    if(sub){ sub.dataset.pen = cartSubtotal(); sub.textContent = money(cartSubtotal()); }
  }

  function renderCartFull(){
    const items = $('#cartItems');
    const totals = $('#cartTotals');
    if(!items) return;
    const cart = getCart();
    if(cart.length===0){
      items.innerHTML = '<p style="color:var(--ink-3);padding:30px;text-align:center">Tu carrito está vacío. <button class="f-link" data-action="cart-continue">Explorar catálogo</button></p>';
      if(totals) totals.innerHTML = '<div class="sum-row"><span>Subtotal</span><b>'+money(0)+'</b></div><div class="sum-row total"><span>Total</span><b>'+money(0)+'</b></div>';
      return;
    }
    items.innerHTML = cart.map(i=>{
      const p = DATA.productos.find(x=>x.id===i.id); if(!p) return '';
      return `
        <div class="cart-item">
          <img src="${p.img}" alt="${esc(p.nombre)}">
          <div class="ci-info">
            <b>${esc(p.nombre)}</b>
            <small>${esc(p.negocio)} · ${money(p.precio)}</small>
            <div class="ci-qty">
              <button data-action="qty" data-id="${p.id}" data-d="-1">−</button>
              <span>${i.qty}</span>
              <button data-action="qty" data-id="${p.id}" data-d="1">+</button>
            </div>
          </div>
          <div style="text-align:right">
            <div class="ci-price">${money(p.precio*i.qty)}</div>
            <button class="ci-rm" data-action="rm-cart" data-id="${p.id}">Quitar</button>
          </div>
        </div>
      `;
    }).join('');
    const sub = cartSubtotal();
    const cupon = store.get('cupon',null);
    const discount = cupon ? sub*cupon.pct : 0;
    const ship = sub>0 ? 8 : 0;
    const total = sub - discount + ship;
    if(totals){
      totals.innerHTML = `
        <div class="sum-row"><span>Subtotal</span><b>${money(sub)}</b></div>
        ${cupon?`<div class="sum-row"><span>Descuento (${cupon.code})</span><b style="color:var(--leaf)">− ${money(discount)}</b></div>`:''}
        <div class="sum-row"><span>Delivery</span><b>${money(ship)}</b></div>
        <div class="sum-row total"><span>Total</span><b>${money(total)}</b></div>
      `;
    }
  }

  function initCartHandlers(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action]');
      if(!b) return;
      const act = b.dataset.action;
      if(act==='add-cart'){
        addToCart(b.dataset.id,1);
      }else if(act==='add-cart-modal'){
        const qty = parseInt($('#prodQty')?.value||'1',10);
        addToCart(b.dataset.id,qty);
        closeModal('mdProduct');
      }else if(act==='open-cart'){
        closeModal('cartPop');
        openModal('mdCart');
      }else if(act==='checkout-open'){
        LJ.closeAllModals();
        startCheckout();
      }else if(act==='cart-continue'){
        closeModal('mdCart');
        document.getElementById('catalogo').scrollIntoView({behavior:'smooth'});
      }else if(act==='clear-cart'){
        confirm('¿Vaciar todo el carrito?',(ok)=>{ if(ok) clearCart(); });
      }else if(act==='qty'){
        changeQty(b.dataset.id, parseInt(b.dataset.d,10));
      }else if(act==='rm-cart'){
        removeFromCart(b.dataset.id);
      }else if(act==='coupon-apply'){
        applyCoupon();
      }
    });
    // Cart mini popover open
    const cartBtn = $('#cartBtn');
    const cartPop = $('#cartPop');
    if(cartBtn && cartPop){
      cartBtn.addEventListener('click',(e)=>{
        e.stopPropagation();
        renderCartMini();
        cartPop.classList.toggle('show');
      });
    }
    // Cart mini "view cart" / "checkout"
  }

  /* ---------- COUPONS ---------- */
  const COUPONS = {
    'JOYA10':{code:'JOYA10',pct:0.10},
    'JOYA20':{code:'JOYA20',pct:0.20},
    'BIENVENIDA':{code:'BIENVENIDA',pct:0.15}
  };
  function applyCoupon(){
    const inp = $('#couponInput');
    const msg = $('#couponMsg');
    const code = (inp.value||'').trim().toUpperCase();
    if(!code){ msg.textContent='Ingresa un código'; msg.className='form-msg err'; return; }
    if(COUPONS[code]){
      store.set('cupon', COUPONS[code]);
      msg.textContent='¡Cupón aplicado! '+Math.round(COUPONS[code].pct*100)+'% de descuento.';
      msg.className='form-msg ok';
      renderCartFull();
      toast('Cupón aplicado: '+code,'ok');
    }else{
      msg.textContent='Cupón inválido. Prueba JOYA10.';
      msg.className='form-msg err';
    }
  }

  /* ---------- FAVORITOS ---------- */
  function toggleFav(id){
    const favs = store.get('favs',[]);
    const idx = favs.indexOf(id);
    if(idx>=0){ favs.splice(idx,1); toast('Quitado de favoritos','info'); }
    else { favs.push(id); toast('Agregado a favoritos','ok'); }
    store.set('favs',favs);
    updateCartUI();
    renderCatalog();
    renderFavs();
  }
  function renderFavs(){
    const body = $('#favsBody'); if(!body) return;
    const favs = store.get('favs',[]);
    if(favs.length===0){
      body.innerHTML = `
        <div class="m-form">
          <h3>Mis favoritos</h3>
          <p>Todavía no tienes favoritos. Toca el ❤ en cualquier producto para guardarlo aquí.</p>
          <button class="btn btn-solid" data-action="close-modal" style="justify-content:center" onclick="LJ.closeModal('mdFavs')">Explorar el catálogo</button>
        </div>
      `;
      return;
    }
    body.innerHTML = '<div class="m-form"><h3>Mis favoritos</h3><p>'+favs.length+' producto(s) guardado(s)</p><div style="display:grid;gap:10px">'+favs.map(id=>{
      const p = DATA.productos.find(x=>x.id===id); if(!p) return '';
      return `
        <div class="cart-item">
          <img src="${p.img}" alt="${esc(p.nombre)}">
          <div class="ci-info">
            <b>${esc(p.nombre)}</b>
            <small>${esc(p.negocio)}</small>
          </div>
          <div style="text-align:right">
            <div class="ci-price">${money(p.precio)}</div>
            <button class="ci-rm" data-action="fav-toggle" data-id="${p.id}">Quitar</button>
          </div>
        </div>
      `;
    }).join('')+'</div><button class="btn btn-solid" data-action="add-all-favs" style="justify-content:center;margin-top:14px">Agregar todos al carrito</button></div>';
  }

  /* ---------- CHECKOUT ---------- */
  const CHECKOUT_STEPS = ['Envío','Pago','Revisión'];
  let ckStep = 0;
  let ckData = {ship:{name:'',phone:'',addr:'',city:'La Joya',method:'delivery'},pay:{method:'card',card:'',name:'',expiry:'',cvv:''}};

  function startCheckout(){
    const cart = getCart();
    if(cart.length===0){ toast('Tu carrito está vacío','err'); return; }
    ckStep = 0;
    renderCheckout();
    openModal('mdCheckout');
  }

  function renderCheckout(){
    const steps = $('#ckSteps');
    const body = $('#ckBody');
    const side = $('#ckSide');
    if(!body) return;
    steps.innerHTML = CHECKOUT_STEPS.map((s,i)=>`<li class="${i===ckStep?'on':(i<ckStep?'done':'')}">${esc(s)}</li>`).join('');
    const cart = getCart();
    const sub = cartSubtotal();
    const cupon = store.get('cupon',null);
    const discount = cupon ? sub*cupon.pct : 0;
    const ship = ckData.ship.method==='delivery'?8:0;
    const total = sub - discount + ship;
    side.innerHTML = `
      <div class="ck-order">
        ${cart.map(i=>{
          const p = DATA.productos.find(x=>x.id===i.id); if(!p) return '';
          return `<div class="oi"><span>${i.qty} × ${esc(p.nombre)}</span><b>${money(p.precio*i.qty)}</b></div>`;
        }).join('')}
      </div>
      <div class="sum-box">
        <div class="sum-row"><span>Subtotal</span><b>${money(sub)}</b></div>
        ${cupon?`<div class="sum-row"><span>Descuento</span><b style="color:var(--leaf)">− ${money(discount)}</b></div>`:''}
        <div class="sum-row"><span>Envío</span><b>${ship===0?'Gratis':money(ship)}</b></div>
        <div class="sum-row total"><span>Total</span><b>${money(total)}</b></div>
      </div>
    `;
    if(ckStep===0){
      body.innerHTML = `
        <div class="ck-step">
          <h4>Datos de envío</h4>
          <div class="two-col">
            <input class="field" id="ckName" placeholder="Nombres y apellidos *" value="${esc(ckData.ship.name)}">
            <input class="field" id="ckPhone" type="tel" maxlength="9" placeholder="Celular *" value="${esc(ckData.ship.phone)}">
          </div>
          <textarea class="field" id="ckAddr" placeholder="Dirección completa (calle, número, referencia) *">${esc(ckData.ship.addr)}</textarea>
          <input class="field" id="ckCity" placeholder="Ciudad" value="${esc(ckData.ship.city)}" style="margin-top:8px">
          <div style="margin-top:14px">
            <label style="font-size:.78rem;color:var(--ink-3);font-weight:700;letter-spacing:.06em;text-transform:uppercase;display:block;margin-bottom:8px">Método de entrega</label>
            <div class="ck-method">
              <label class="${ckData.ship.method==='delivery'?'on':''}">
                <input type="radio" name="shipm" value="delivery" ${ckData.ship.method==='delivery'?'checked':''} style="display:none">
                <span style="font-size:1.4rem">🛵</span><b>Delivery</b><small>S/ 8</small>
              </label>
              <label class="${ckData.ship.method==='pickup'?'on':''}">
                <input type="radio" name="shipm" value="pickup" ${ckData.ship.method==='pickup'?'checked':''} style="display:none">
                <span style="font-size:1.4rem">🏪</span><b>Recojo</b><small>Gratis</small>
              </label>
            </div>
          </div>
        </div>
        <div class="ck-nav">
          <button class="btn btn-ghost" data-action="ck-cancel">Cancelar</button>
          <button class="btn btn-solid" data-action="ck-next">Continuar →</button>
        </div>
      `;
      // bind radios
      $$('input[name="shipm"]',body).forEach(r=>r.addEventListener('change',()=>{
        ckData.ship.method = r.value;
        $$('label',r.closest('.ck-method')).forEach(l=>l.classList.remove('on'));
        r.closest('label').classList.add('on');
        renderCheckout();
      }));
    }else if(ckStep===1){
      body.innerHTML = `
        <div class="ck-step">
          <h4>Método de pago</h4>
          <div class="ck-method">
            <label class="${ckData.pay.method==='card'?'on':''}" data-pm="card">
              <span style="font-size:1.4rem">💳</span><b>Tarjeta</b><small>Visa / MC</small>
            </label>
            <label class="${ckData.pay.method==='yape'?'on':''}" data-pm="yape">
              <span style="font-size:1.4rem">📱</span><b>Yape / Plin</b><small>QR</small>
            </label>
            <label class="${ckData.pay.method==='cash'?'on':''}" data-pm="cash">
              <span style="font-size:1.4rem">💵</span><b>Efectivo</b><small>Pago contra entrega</small>
            </label>
          </div>
          <div id="payForm" style="margin-top:14px"></div>
        </div>
        <div class="ck-nav">
          <button class="btn btn-ghost" data-action="ck-prev">← Atrás</button>
          <button class="btn btn-solid" data-action="ck-next">Continuar →</button>
        </div>
      `;
      $$('[data-pm]',body).forEach(l=>l.addEventListener('click',()=>{
        ckData.pay.method = l.dataset.pm;
        $$('[data-pm]',body).forEach(x=>x.classList.remove('on'));
        l.classList.add('on');
        renderPayForm();
      }));
      renderPayForm();
    }else if(ckStep===2){
      body.innerHTML = `
        <div class="ck-step">
          <h4>Revisa tu pedido</h4>
          <div style="background:var(--paper-3);padding:14px;border-radius:10px;margin-bottom:10px">
            <b style="font-family:var(--ff-serif);display:block;margin-bottom:4px">Envío</b>
            <p style="font-size:.84rem;color:var(--ink-2);margin:0">${esc(ckData.ship.name)} · ${esc(ckData.ship.phone)}</p>
            <p style="font-size:.84rem;color:var(--ink-2);margin:2px 0 0">${esc(ckData.ship.addr)} · ${esc(ckData.ship.city)}</p>
            <p style="font-size:.78rem;color:var(--accent);font-weight:700;margin-top:4px">${ckData.ship.method==='delivery'?'🛵 Delivery · S/ 8':'🏪 Recojo en tienda · Gratis'}</p>
          </div>
          <div style="background:var(--paper-3);padding:14px;border-radius:10px">
            <b style="font-family:var(--ff-serif);display:block;margin-bottom:4px">Pago</b>
            <p style="font-size:.84rem;color:var(--ink-2);margin:0">${ckData.pay.method==='card'?'💳 Tarjeta':ckData.pay.method==='yape'?'📱 Yape / Plin':'💵 Efectivo'}</p>
            ${ckData.pay.method==='card'?`<p style="font-size:.78rem;color:var(--ink-3);margin-top:2px">Terminada en ${esc(ckData.pay.card.slice(-4))||'****'}</p>`:''}
          </div>
          <p style="font-size:.74rem;color:var(--ink-3);margin-top:14px">⚠️ Modo demostración: no se realizará ningún cobro real. La pasarela está en sandbox.</p>
        </div>
        <div class="ck-nav">
          <button class="btn btn-ghost" data-action="ck-prev">← Atrás</button>
          <button class="btn btn-solid" data-action="ck-place">Confirmar pedido</button>
        </div>
      `;
    }
  }
  function renderPayForm(){
    const form = $('#payForm'); if(!form) return;
    if(ckData.pay.method==='card'){
      form.innerHTML = `
        <input class="field" id="ckCard" placeholder="Número de tarjeta (4242 4242 4242 4242)" maxlength="19" value="${esc(ckData.pay.card)}">
        <div class="two-col" style="margin-top:8px">
          <input class="field" id="ckCardName" placeholder="Nombre en la tarjeta" value="${esc(ckData.pay.name)}">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <input class="field" id="ckExp" placeholder="MM/AA" maxlength="5" value="${esc(ckData.pay.expiry)}">
            <input class="field" id="ckCvv" placeholder="CVV" maxlength="4" type="password" value="${esc(ckData.pay.cvv)}">
          </div>
        </div>
        <p class="hint">Sandbox Culqi · usa cualquier fecha futura y CVV</p>
      `;
      $('#ckCard').addEventListener('input',(e)=>{
        let v = e.target.value.replace(/\D/g,'').slice(0,16);
        v = v.match(/.{1,4}/g)?.join(' ') || '';
        e.target.value = v; ckData.pay.card = v;
      });
      $('#ckExp').addEventListener('input',(e)=>{
        let v = e.target.value.replace(/\D/g,'').slice(0,4);
        if(v.length>=3) v = v.slice(0,2)+'/'+v.slice(2);
        e.target.value = v; ckData.pay.expiry = v;
      });
    }else if(ckData.pay.method==='yape'){
      form.innerHTML = `
        <div style="text-align:center;padding:20px;background:#fff;border:1px solid var(--line);border-radius:10px">
          <div style="width:140px;height:140px;background:repeating-linear-gradient(45deg,#7C3AED,#7C3AED 8px,#9333EA 8px,#9333EA 16px);margin:0 auto 14px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:700">QR DEMO</div>
          <p style="font-size:.84rem;color:var(--ink-2);margin:0">Escanea este QR con <b>Yape</b> o <b>Plin</b> para pagar.</p>
          <p class="hint">Monto: <b style="color:var(--accent)">${money(cartSubtotal()+(ckData.ship.method==='delivery'?8:0)-(store.get('cupon',null)?cartSubtotal()*store.get('cupon',null).pct:0))}</b></p>
        </div>
      `;
    }else{
      form.innerHTML = `<p class="hint">💵 Paga en efectivo al momento de la entrega. Lleva el monto exacto.</p>`;
    }
  }

  function initCheckout(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action]');
      if(!b) return;
      const act = b.dataset.action;
      if(act==='ck-next'){
        if(ckStep===0){
          ckData.ship.name = $('#ckName').value.trim();
          ckData.ship.phone = $('#ckPhone').value.trim();
          ckData.ship.addr = $('#ckAddr').value.trim();
          ckData.ship.city = $('#ckCity').value.trim() || 'La Joya';
          if(!ckData.ship.name || !ckData.ship.phone || !ckData.ship.addr){ toast('Completa nombre, teléfono y dirección','err'); return; }
          if(ckData.ship.phone.length!==9){ toast('El celular debe tener 9 dígitos','err'); return; }
        }else if(ckStep===1){
          if(ckData.pay.method==='card'){
            ckData.pay.card = $('#ckCard').value.trim();
            ckData.pay.name = $('#ckCardName').value.trim();
            ckData.pay.expiry = $('#ckExp').value.trim();
            ckData.pay.cvv = $('#ckCvv').value.trim();
            if(ckData.pay.card.replace(/\s/g,'').length<16){ toast('Número de tarjeta inválido','err'); return; }
            if(!ckData.pay.name){ toast('Ingresa el nombre del titular','err'); return; }
            if(!/^\d{2}\/\d{2}$/.test(ckData.pay.expiry)){ toast('Fecha inválida (MM/AA)','err'); return; }
            if(ckData.pay.cvv.length<3){ toast('CVV inválido','err'); return; }
          }
        }
        ckStep++; renderCheckout();
      }else if(act==='ck-prev'){ ckStep = Math.max(0,ckStep-1); renderCheckout(); }
      else if(act==='ck-cancel'){ LJ.closeModal('mdCheckout'); }
      else if(act==='ck-place'){ placeOrder(); }
    });
  }

  function placeOrder(){
    const cart = getCart();
    if(cart.length===0){ toast('Carrito vacío','err'); return; }
    const sub = cartSubtotal();
    const cupon = store.get('cupon',null);
    const discount = cupon ? sub*cupon.pct : 0;
    const ship = ckData.ship.method==='delivery'?8:0;
    const total = sub - discount + ship;
    const orders = store.get('orders',[]);
    const order = {
      id: 'LJ-'+Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      items: cart.map(i=>({id:i.id,qty:i.qty})),
      ship: ckData.ship,
      pay: {method: ckData.pay.method, last4: ckData.pay.card?ckData.pay.card.slice(-4):null},
      total, sub, discount, ship,
      status: ckData.pay.method==='cash' ? 'pend' : 'paid'
    };
    orders.unshift(order);
    store.set('orders',orders);
    // Webhook simulation
    LJ.app?.logWebhook?.({
      event: 'order.created',
      id: order.id,
      total: order.total,
      method: order.pay.method,
      at: order.date
    });
    // Clear cart
    setCart([]); store.del('cupon');
    LJ.closeModal('mdCheckout');
    toast('¡Pedido '+order.id+' confirmado!','ok');
    setTimeout(()=>{ openOrderDetail(order.id); },300);
  }

  /* ---------- ORDERS ---------- */
  function renderOrders(){
    const list = $('#ordersList'); if(!list) return;
    const orders = store.get('orders',[]);
    if(orders.length===0){
      list.innerHTML = '<p style="text-align:center;color:var(--ink-3);padding:30px">Aún no tienes pedidos. Realiza tu primera compra en el catálogo.</p>';
      return;
    }
    list.innerHTML = orders.map(o=>{
      const total = o.total;
      return `
        <div class="order-card" data-action="open-order" data-id="${o.id}">
          <div>
            <b>Pedido ${esc(o.id)}</b>
            <small>${new Date(o.date).toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})} · ${o.items.length} producto(s) · ${esc(o.ship.method==='delivery'?'Delivery':'Recojo')}</small>
          </div>
          <div style="text-align:right">
            <span class="order-status ${o.status}">${o.status==='pend'?'Pendiente':o.status==='paid'?'Pagado':o.status==='shipped'?'En camino':o.status==='delivered'?'Entregado':'Cancelado'}</span>
            <b style="display:block;margin-top:6px;font-family:var(--ff-serif);color:var(--accent)">${money(total)}</b>
          </div>
        </div>
      `;
    }).join('');
  }
  function openOrderDetail(id){
    const o = store.get('orders',[]).find(x=>x.id===id); if(!o) return;
    LJ.closeAllModals();
    const statusLabels = {pend:'Pendiente de pago',paid:'Pagado',shipped:'En camino',delivered:'Entregado',cancel:'Cancelado'};
    $('#mdOrderBody').innerHTML = `
      <div class="m-form">
        <span class="label">Pedido ${esc(o.id)}</span>
        <h3>Detalle del pedido</h3>
        <p style="color:var(--ink-3)">${new Date(o.date).toLocaleString('es-PE')}</p>
        <span class="order-status ${o.status}" style="display:inline-block;margin:6px 0">${statusLabels[o.status]||o.status}</span>
        <div style="background:var(--paper-3);padding:14px;border-radius:10px;margin:8px 0">
          <b style="font-family:var(--ff-serif);display:block;margin-bottom:6px">Productos</b>
          ${o.items.map(i=>{
            const p = DATA.productos.find(x=>x.id===i.id); if(!p) return '';
            return `<div class="oi" style="display:flex;justify-content:space-between;font-size:.84rem;padding:4px 0;border-bottom:1px dashed var(--line)"><span>${i.qty} × ${esc(p.nombre)}</span><b>${money(p.precio*i.qty)}</b></div>`;
          }).join('')}
        </div>
        <div class="sum-box">
          <div class="sum-row"><span>Subtotal</span><b>${money(o.sub)}</b></div>
          ${o.discount?`<div class="sum-row"><span>Descuento</span><b style="color:var(--leaf)">− ${money(o.discount)}</b></div>`:''}
          <div class="sum-row"><span>Envío</span><b>${o.ship==='delivery'?money(o.ship):'Gratis'}</b></div>
          <div class="sum-row total"><span>Total</span><b>${money(o.total)}</b></div>
        </div>
        <div style="background:var(--paper-3);padding:14px;border-radius:10px;margin-top:8px">
          <b style="font-family:var(--ff-serif);display:block;margin-bottom:4px">Envío</b>
          <p style="font-size:.84rem;color:var(--ink-2);margin:0">${esc(o.ship.name)} · ${esc(o.ship.phone)}</p>
          <p style="font-size:.84rem;color:var(--ink-2);margin:2px 0 0">${esc(o.ship.addr)} · ${esc(o.ship.city)}</p>
        </div>
        <button class="btn btn-ghost" data-action="open-orders" style="width:100%;justify-content:center;margin-top:14px">Volver a mis pedidos</button>
      </div>
    `;
    openModal('mdOrder');
  }
  function initOrders(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action]');
      if(!b) return;
      if(b.dataset.action==='open-orders'){
        LJ.closeAllModals(); renderOrders(); openModal('mdOrders');
      }else if(b.dataset.action==='open-order'){
        openOrderDetail(b.dataset.id);
      }else if(b.dataset.action==='orders-open'){
        renderOrders(); openModal('mdOrders');
      }else if(b.dataset.action==='favs-open'){
        renderFavs(); openModal('mdFavs');
      }else if(b.dataset.action==='add-all-favs'){
        const favs = store.get('favs',[]);
        favs.forEach(id=>addToCart(id,1));
        LJ.closeModal('mdFavs');
      }
    });
  }

  /* ---------- BUSINESS DIRECTORY ---------- */
  let dirCat = 'todo';
  let dirQuery = '';
  function renderDirectory(){
    const grid = $('#dirGrid'); if(!grid) return;
    const empty = $('#dirEmpty');
    const count = $('#dirCount');
    let list = DATA.negocios.slice();
    if(dirCat!=='todo') list = list.filter(b=>b.cat===dirCat);
    if(dirQuery){
      const q = dirQuery.toLowerCase();
      list = list.filter(b=>(b.nombre+' '+b.desc+' '+b.cat+' '+b.zona).toLowerCase().includes(q));
    }
    if(count) count.textContent = list.length+' negocios';
    if(list.length===0){ grid.innerHTML=''; if(empty) empty.hidden=false; return; }
    if(empty) empty.hidden=true;
    const icons = {comida:'🍴',mercados:'🛒',agricola:'🌾',servicios:'🔧',salud:'💊',transporte:'🚕',turismo:'🏨',ferreteria:'🔨',moda:'👕',tech:'📱'};
    grid.innerHTML = list.map(b=>`
      <article class="biz-card" data-action="open-business" data-id="${b.id}">
        <div class="biz-cover">
          <img src="${b.cover}" alt="${esc(b.nombre)}" loading="lazy">
          <span class="biz-cat-tag">${icons[b.cat]||'📍'} ${esc(b.cat)}</span>
        </div>
        <div class="biz-body">
          <span class="biz-name">${esc(b.nombre)}</span>
          <span class="biz-desc">${esc(b.desc)}</span>
          <div class="biz-meta">
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${esc(b.zona)} · ${esc(b.dir)}</span>
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${esc(b.horario)}</span>
          </div>
          <div class="biz-foot">
            <span class="biz-rating">★ ${b.rating}</span>
            <a class="biz-wa" href="https://wa.me/${b.wa}" target="_blank" rel="noopener" onclick="event.stopPropagation()">WhatsApp</a>
          </div>
        </div>
      </article>
    `).join('');
  }
  function initDirectory(){
    const chips = $('#dirChips'); if(chips){
      chips.addEventListener('click',(e)=>{
        const b = e.target.closest('[data-action="dir-chip"]'); if(!b) return;
        $$('button',chips).forEach(x=>x.classList.remove('on'));
        b.classList.add('on'); dirCat = b.dataset.cat; renderDirectory();
      });
    }
    const search = $('#dirSearch');
    if(search){
      search.addEventListener('input',()=>{
        dirQuery = search.value.trim();
        const cnt = $('#dirCount'); if(cnt) cnt.textContent = '';
        renderDirectory();
      });
    }
    renderDirectory();
  }

  function openBusiness(id){
    const b = DATA.negocios.find(x=>x.id===id); if(!b) return;
    const icons = {comida:'🍴',mercados:'🛒',agricola:'🌾',servicios:'🔧',salud:'💊',transporte:'🚕',turismo:'🏨',ferreteria:'🔨',moda:'👕',tech:'📱'};
    const prods = DATA.productos.filter(p=>p.negocio===b.nombre);
    LJ.closeAllModals();
    $('#mdBizBody').innerHTML = `
      <div class="pop-img" style="position:relative">
        <img src="${b.cover.replace('/800/450','/1000/440')}" alt="${esc(b.nombre)}">
        <span class="biz-cat-tag" style="position:absolute;top:14px;left:14px;background:rgba(31,26,18,.85);color:var(--paper);font-size:.7rem;font-weight:700;padding:5px 12px;border-radius:999px">${icons[b.cat]||'📍'} ${esc(b.cat)}</span>
      </div>
      <div class="m-form">
        <span class="label">${esc(b.zona)}</span>
        <h3>${esc(b.nombre)}</h3>
        <p>${esc(b.desc)}</p>
        <div style="display:grid;gap:8px;margin:10px 0">
          <div style="display:flex;align-items:center;gap:8px;font-size:.86rem"><span style="color:var(--accent)">★</span><b>${b.rating}</b> · ${esc(b.horario)}</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:.86rem;color:var(--ink-2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--accent)"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${esc(b.dir)}</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:.86rem;color:var(--ink-2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:var(--accent)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${esc(b.tel)}</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <a class="btn btn-solid" href="https://wa.me/${b.wa}" target="_blank" rel="noopener" style="flex:1;justify-content:center;background:var(--leaf)">WhatsApp</a>
          <button class="btn btn-ghost" data-action="open-biz-map" data-id="${b.id}" style="flex:1;justify-content:center">Ver en mapa</button>
        </div>
        ${prods.length>0?`
          <h4 style="font-family:var(--ff-serif);font-size:1.1rem;font-weight:600;margin:18px 0 8px">Productos de este negocio</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px">
            ${prods.map(p=>`
              <div class="prod-card" style="cursor:pointer" data-action="open-product" data-id="${p.id}">
                <div class="prod-img"><img src="${p.img}" alt="${esc(p.nombre)}" style="aspect-ratio:1/1;object-fit:cover"></div>
                <div class="prod-body" style="padding:8px">
                  <span class="prod-name" style="font-size:.84rem">${esc(p.nombre)}</span>
                  <span class="prod-price" style="font-size:.95rem">${money(p.precio)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `:''}
      </div>
    `;
    openModal('mdBusiness');
    $('#mdBizBody').addEventListener('click',(e)=>{
      const b2 = e.target.closest('[data-action="open-biz-map"]');
      if(b2){ LJ.closeModal('mdBusiness'); LJ.app.openBizMap(b2.dataset.id); }
    });
  }

  /* ---------- JOBS ---------- */
  let empCat = 'todas';
  let empQuery = '';
  function renderJobs(){
    const grid = $('#empGrid'); if(!grid) return;
    let list = DATA.empleos.slice();
    if(empCat!=='todas') list = list.filter(j=>j.cat===empCat);
    if(empQuery){
      const q = empQuery.toLowerCase();
      list = list.filter(j=>(j.titulo+' '+j.empresa+' '+j.cat).toLowerCase().includes(q));
    }
    const icons = {agricultura:'🌾',comercio:'🛒',servicios:'🔧',transporte:'🚕',estado:'🏛',turismo:'🏨'};
    grid.innerHTML = list.map(j=>`
      <article class="job-card ${j.cat==='estado'?'state':''}">
        <span class="job-cat">${icons[j.cat]||'💼'} ${esc(j.cat)}</span>
        <span class="job-title">${esc(j.titulo)}</span>
        <span class="job-co">${esc(j.empresa)}</span>
        <div class="job-meta">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${esc(j.zona)}</span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${esc(j.tipo)}</span>
        </div>
        <p style="font-size:.82rem;color:var(--ink-3);margin:6px 0">${esc(j.desc)}</p>
        <div class="job-foot">
          <span class="job-salary">S/ ${fmt(j.salario)}<small style="font-size:.7rem;color:var(--ink-3);font-family:var(--ff-sans)"> / mes</small></span>
          <button class="job-apply" data-action="open-job" data-id="${j.id}">Postular</button>
        </div>
      </article>
    `).join('');
  }
  function initJobs(){
    const chips = $('#empChips'); if(chips){
      chips.addEventListener('click',(e)=>{
        const b = e.target.closest('[data-action="emp-chip"]'); if(!b) return;
        $$('button',chips).forEach(x=>x.classList.remove('on'));
        b.classList.add('on'); empCat = b.dataset.cat; renderJobs();
      });
    }
    const search = $('#empSearch');
    if(search) search.addEventListener('input',()=>{ empQuery = search.value.trim(); renderJobs(); });
    renderJobs();
  }
  function openJob(id){
    const j = DATA.empleos.find(x=>x.id===id); if(!j) return;
    $('#jobVacante').value = j.titulo+' · '+j.empresa;
    $('#jobId').value = j.id;
    $('#jobName').value = ''; $('#jobPhone').value = ''; $('#jobMsg').value = '';
    $('#jobErr').textContent = '';
    LJ.closeAllModals(); openModal('jobModal');
  }

  /* ---------- JOB APPLICATION ---------- */
  function initJobApply(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="job-send"]'); if(!b) return;
      const name = $('#jobName').value.trim();
      const phone = $('#jobPhone').value.trim();
      if(!name){ $('#jobErr').textContent='Ingresa tu nombre completo.'; $('#jobErr').className='form-msg err'; return; }
      if(phone.length!==9){ $('#jobErr').textContent='El celular debe tener 9 dígitos.'; $('#jobErr').className='form-msg err'; return; }
      const apps = store.get('apps',[]);
      apps.push({
        id: $('#jobId').value, name, phone, msg: $('#jobMsg').value.trim(),
        at: new Date().toISOString(), status:'enviada'
      });
      store.set('apps',apps);
      LJ.app.logWebhook?.({event:'job.application', jobId:$('#jobId').value, name, at:new Date().toISOString()});
      LJ.closeModal('jobModal');
      toast('¡Postulación enviada! El negocio te contactará pronto.','ok');
    });
  }

  /* ---------- BIZ REGISTER ---------- */
  function initBizModal(){
    const cat = $('#bizCat'); if(cat){
      cat.innerHTML = DATA.categorias.map(c=>`<option value="${c.id}">${c.icon} ${esc(c.nombre)}</option>`).join('');
    }
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action]');
      if(!b) return;
      if(b.dataset.action==='open-biz-modal'){
        LJ.closeAllModals(); openModal('bizModal');
      }else if(b.dataset.action==='pick-location'){
        LJ.app.openMapPicker('#bizLat','#bizLng');
      }else if(b.dataset.action==='biz-submit'){
        submitBiz();
      }
    });
  }
  function submitBiz(){
    const fields = ['bizName','bizCat','bizDesc','bizPhone','bizWa','bizEmail','bizAddr','bizRef','bizHours','bizLat','bizLng','bizOwner','bizPass'];
    const data = {};
    fields.forEach(f=>data[f] = $('#'+f)?.value?.trim()||'');
    if(!data.bizName || !data.bizPhone || !data.bizWa || !data.bizEmail || !data.bizAddr || !data.bizLat || !data.bizLng || !data.bizOwner || !data.bizPass){
      $('#bizErr').textContent = 'Completa los campos obligatorios (*).'; $('#bizErr').className='form-msg err'; return;
    }
    if(data.bizPhone.length!==9 || data.bizWa.length!==9){
      $('#bizErr').textContent = 'Los teléfonos deben tener 9 dígitos.'; $('#bizErr').className='form-msg err'; return;
    }
    if(data.bizPass.length<6){
      $('#bizErr').textContent = 'La contraseña debe tener al menos 6 caracteres.'; $('#bizErr').className='form-msg err'; return;
    }
    const myBiz = store.get('myBiz',[]);
    const id = 'mb'+(myBiz.length+1);
    const newBiz = {
      id, nombre:data.bizName, cat:data.bizCat, desc:data.bizDesc,
      tel:data.bizPhone, wa:'51'+data.bizWa, email:data.bizEmail,
      dir:data.bizAddr, ref:data.bizRef, horario:data.bizHours||'L–S 8:00–18:00',
      lat:parseFloat(data.bizLat), lng:parseFloat(data.bizLng),
      owner:data.bizOwner, pass:data.bizPass,
      createdAt:new Date().toISOString(), status:'pendiente'
    };
    myBiz.push(newBiz); store.set('myBiz',myBiz);
    LJ.app.logWebhook?.({event:'biz.submitted', bizId:id, name:data.bizName, at:newBiz.createdAt});
    LJ.closeModal('bizModal');
    toast('¡Negocio publicado! Verificación en 48h (demo).','ok');
    // Add to global list (in memory only)
    DATA.negocios.push({...newBiz, rating:5, zona:'Centro', cover:'https://picsum.photos/seed/'+id+'/800/450.jpg'});
    renderDirectory();
  }

  /* ---------- PROFILE / PANEL (called from app.js) ---------- */
  function renderProfile(tab){
    const body = $('#profBody'); if(!body) return;
    const u = store.get('user',null);
    if(!u){
      body.innerHTML = '<div class="m-form"><h3>Mi cuenta</h3><p>Inicia sesión para ver tu perfil, pedidos y postulaciones.</p><button class="btn btn-solid" data-action="auth-open" style="justify-content:center">Identifícate</button></div>';
      return;
    }
    const orders = store.get('orders',[]);
    const apps = store.get('apps',[]);
    const favs = store.get('favs',[]);
    const myBiz = store.get('myBiz',[]);
    const tabs = [
      {id:'dash',label:'Resumen'},
      {id:'orders',label:'Mis pedidos ('+orders.length+')'},
      {id:'apps',label:'Postulaciones ('+apps.length+')'},
      {id:'favs',label:'Favoritos ('+favs.length+')'},
      {id:'biz',label:'Mi negocio ('+myBiz.length+')'}
    ];
    body.innerHTML = `
      <div class="m-form">
        <div class="panel-tabs">
          ${tabs.map(t=>`<button class="${t.id===tab?'on':''}" data-action="profile-tab" data-tab="${t.id}">${esc(t.label)}</button>`).join('')}
        </div>
        <div id="profTab"></div>
      </div>
    `;
    renderProfileTab(tab||'dash');
    body.querySelector('.panel-tabs').addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="profile-tab"]'); if(!b) return;
      renderProfileTab(b.dataset.tab);
      $$('[data-action="profile-tab"]',body).forEach(x=>x.classList.toggle('on',x.dataset.tab===b.dataset.tab));
    });
  }
  function renderProfileTab(tab){
    const div = $('#profTab'); if(!div) return;
    const u = store.get('user',null);
    const orders = store.get('orders',[]);
    const apps = store.get('apps',[]);
    const favs = store.get('favs',[]);
    const myBiz = store.get('myBiz',[]);
    if(tab==='dash'){
      div.innerHTML = `
        <div class="panel-stats">
          <div class="panel-stat"><b>${orders.length}</b><span>Pedidos</span></div>
          <div class="panel-stat"><b>${apps.length}</b><span>Postulaciones</span></div>
          <div class="panel-stat"><b>${favs.length}</b><span>Favoritos</span></div>
          <div class="panel-stat"><b>${myBiz.length}</b><span>Negocios</span></div>
        </div>
        <div class="panel-chart">
          <h4>Tus pedidos por mes</h4>
          <div class="chart-bars">${chartBars(orders)}</div>
        </div>
        <div style="background:#fff;border:1px solid var(--line);border-radius:10px;padding:18px">
          <h4 style="font-family:var(--ff-serif);font-weight:600;margin:0 0 10px">Datos de tu cuenta</h4>
          <p style="font-size:.86rem;color:var(--ink-2);margin:4px 0"><b>Nombre:</b> ${esc(u.name)}</p>
          <p style="font-size:.86rem;color:var(--ink-2);margin:4px 0"><b>Email:</b> ${esc(u.email)}</p>
          <p style="font-size:.86rem;color:var(--ink-2);margin:4px 0"><b>Rol:</b> ${u.role==='negocio'?'Negocio':'Vecino'}</p>
          ${u.phone?`<p style="font-size:.86rem;color:var(--ink-2);margin:4px 0"><b>Teléfono:</b> ${esc(u.phone)}</p>`:''}
          <button class="btn btn-ghost" data-action="logout" style="margin-top:14px">Cerrar sesión</button>
        </div>
      `;
    }else if(tab==='orders'){
      if(orders.length===0){
        div.innerHTML = '<p style="color:var(--ink-3);padding:20px;text-align:center">Aún no tienes pedidos.</p>';
      }else{
        div.innerHTML = '<div class="orders-list" style="padding:0">'+orders.map(o=>`
          <div class="order-card" data-action="open-order" data-id="${o.id}">
            <div><b>${esc(o.id)}</b><small>${new Date(o.date).toLocaleDateString('es-PE')}</small></div>
            <div style="text-align:right"><span class="order-status ${o.status}">${o.status}</span><b style="display:block;margin-top:4px;color:var(--accent);font-family:var(--ff-serif)">${money(o.total)}</b></div>
          </div>
        `).join('')+'</div>';
      }
    }else if(tab==='apps'){
      if(apps.length===0){
        div.innerHTML = '<p style="color:var(--ink-3);padding:20px;text-align:center">Aún no has postulado a ninguna vacante. <a href="#empleo" class="f-link">Ver empleos</a></p>';
      }else{
        div.innerHTML = '<div class="panel-table"><table><thead><tr><th>Vacante</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>'+apps.map(a=>{
          const j = DATA.empleos.find(x=>x.id===a.id); const title = j?j.titulo:'Vacante #'+a.id;
          return `<tr><td>${esc(title)}</td><td>${new Date(a.at).toLocaleDateString('es-PE')}</td><td><span class="order-status paid">${esc(a.status)}</span></td></tr>`;
        }).join('')+'</tbody></table></div>';
      }
    }else if(tab==='favs'){
      if(favs.length===0){
        div.innerHTML = '<p style="color:var(--ink-3);padding:20px;text-align:center">Sin favoritos todavía.</p>';
      }else{
        div.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">'+favs.map(id=>{
          const p = DATA.productos.find(x=>x.id===id); if(!p) return '';
          return `<div class="prod-card" data-action="open-product" data-id="${p.id}" style="cursor:pointer"><div class="prod-img"><img src="${p.img}" alt=""></div><div class="prod-body" style="padding:8px"><span class="prod-name" style="font-size:.84rem">${esc(p.nombre)}</span><span class="prod-price" style="font-size:.92rem">${money(p.precio)}</span></div></div>`;
        }).join('')+'</div>';
      }
    }else if(tab==='biz'){
      if(myBiz.length===0){
        div.innerHTML = '<p style="color:var(--ink-3);padding:20px;text-align:center">Aún no has publicado un negocio. <button class="f-link" data-action="open-biz-modal">Publica el tuyo gratis</button></p>';
      }else{
        div.innerHTML = myBiz.map(b=>`
          <div style="background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px;margin-bottom:10px">
            <b style="font-family:var(--ff-serif);font-size:1.1rem">${esc(b.nombre)}</b>
            <p style="font-size:.84rem;color:var(--ink-3);margin:4px 0">${esc(b.dir)} · ${esc(b.horario)}</p>
            <span class="order-status ${b.status==='aprobado'?'paid':'pend'}">${esc(b.status)}</span>
            <button class="btn btn-ghost sm" data-action="panel-open" data-tab="dash" style="margin-left:8px">Ver panel →</button>
          </div>
        `).join('');
      }
    }
  }
  function chartBars(orders){
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const now = new Date();
    const last6 = [];
    for(let i=5;i>=0;i--){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const count = orders.filter(o=>{ const od=new Date(o.date); return od.getMonth()===d.getMonth() && od.getFullYear()===d.getFullYear(); }).length;
      last6.push({m:months[d.getMonth()],c:count});
    }
    const max = Math.max(1,...last6.map(x=>x.c));
    return last6.map(x=>`<div class="chart-bar" style="height:${(x.c/max)*100}%" title="${x.c} pedidos"><small>${x.m}</small></div>`).join('');
  }

  /* ---------- PANEL DE NEGOCIO ---------- */
  function renderPanel(tab){
    const body = $('#panelBody'); if(!body) return;
    const myBiz = store.get('myBiz',[]);
    const orders = store.get('orders',[]);
    const tabs = [
      {id:'dash',label:'Dashboard'},
      {id:'prod',label:'Productos'},
      {id:'pedidos',label:'Pedidos'},
      {id:'stats',label:'Estadísticas'}
    ];
    body.innerHTML = `
      <div class="panel-tabs">
        ${tabs.map(t=>`<button class="${t.id===(tab||'dash')?'on':''}" data-action="panel-tab" data-tab="${t.id}">${esc(t.label)}</button>`).join('')}
      </div>
      <div id="panelTab"></div>
    `;
    renderPanelTab(tab||'dash');
    body.querySelector('.panel-tabs').addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="panel-tab"]'); if(!b) return;
      renderPanelTab(b.dataset.tab);
      $$('[data-action="panel-tab"]',body).forEach(x=>x.classList.toggle('on',x.dataset.tab===b.dataset.tab));
    });
  }
  function renderPanelTab(tab){
    const div = $('#panelTab'); if(!div) return;
    const myBiz = store.get('myBiz',[]);
    const orders = store.get('orders',[]);
    const totalSales = orders.reduce((s,o)=>s+o.total,0);
    if(tab==='dash'){
      div.innerHTML = `
        <div class="panel-stats">
          <div class="panel-stat"><b>${orders.length}</b><span>Pedidos totales</span></div>
          <div class="panel-stat"><b>S/ ${fmt(totalSales)}</b><span>Ventas acumuladas</span></div>
          <div class="panel-stat"><b>${myBiz.length}</b><span>Negocios activos</span></div>
          <div class="panel-stat"><b>${store.get('favs',[]).length}</b><span>Clientes únicos</span></div>
        </div>
        <div class="panel-chart">
          <h4>Ventas por mes</h4>
          <div class="chart-bars">${chartBars(orders)}</div>
        </div>
        <div class="panel-table">
          <table>
            <thead><tr><th>Pedido</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>${orders.slice(0,8).map(o=>`<tr><td>${esc(o.id)}</td><td>${new Date(o.date).toLocaleDateString('es-PE')}</td><td>${money(o.total)}</td><td><span class="order-status ${o.status}">${o.status}</span></td></tr>`).join('')}</tbody>
          </table>
        </div>
      `;
    }else if(tab==='prod'){
      div.innerHTML = `
        <p style="color:var(--ink-3);font-size:.86rem">Gestiona los productos de tu negocio.</p>
        <button class="btn btn-solid sm" data-action="open-product-add" style="margin:10px 0">+ Agregar producto</button>
        <div class="panel-table">
          <table>
            <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th></tr></thead>
            <tbody>
              ${DATA.productos.slice(0,8).map(p=>`<tr><td>${esc(p.nombre)}</td><td>${money(p.precio)}</td><td>${p.stock}</td><td>${p.stock>0?'<span class="order-status paid">Activo</span>':'<span class="order-status cancel">Agotado</span>'}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    }else if(tab==='pedidos'){
      div.innerHTML = `
        <div class="panel-table">
          <table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              ${orders.length===0?'<tr><td colspan="5" style="text-align:center;color:var(--ink-3);padding:14px">Sin pedidos todavía</td></tr>':orders.slice(0,12).map(o=>`<tr><td>${esc(o.id)}</td><td>${esc(o.ship.name)}</td><td>${money(o.total)}</td><td><span class="order-status ${o.status}">${o.status}</span></td><td><button class="f-link" data-action="open-order" data-id="${o.id}">Ver</button></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    }else if(tab==='stats'){
      const byMethod = {card:0,yape:0,cash:0};
      orders.forEach(o=>byMethod[o.pay.method]=(byMethod[o.pay.method]||0)+o.total);
      div.innerHTML = `
        <div class="panel-stats">
          <div class="panel-stat"><b>S/ ${fmt(byMethod.card||0)}</b><span>Tarjeta</span></div>
          <div class="panel-stat"><b>S/ ${fmt(byMethod.yape||0)}</b><span>Yape/Plin</span></div>
          <div class="panel-stat"><b>S/ ${fmt(byMethod.cash||0)}</b><span>Efectivo</span></div>
          <div class="panel-stat"><b>${orders.length>0?Math.round(totalSales/orders.length):0}</b><span>Ticket promedio</span></div>
        </div>
        <div class="panel-chart">
          <h4>Comparativa de métodos de pago</h4>
          <div class="chart-bars">
            <div class="chart-bar" style="height:${(byMethod.card/Math.max(1,totalSales))*100}%"><small>Tarjeta</small></div>
            <div class="chart-bar" style="height:${(byMethod.yape/Math.max(1,totalSales))*100}%"><small>Yape</small></div>
            <div class="chart-bar" style="height:${(byMethod.cash/Math.max(1,totalSales))*100}%"><small>Efectivo</small></div>
          </div>
        </div>
      `;
    }
  }

  /* ---------- EVENT HANDLERS GLOBAL ---------- */
  function initGlobalHandlers(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action]');
      if(!b) return;
      const act = b.dataset.action;
      // Ignorar acciones que son manejadas por otros handlers (chat-toggle, chat-open, cookie-accept, etc.)
      if(['chat-toggle','chat-open','cookie-accept','auth-tab','login-demo','logout','menu-open','menu-close','social','to-top','legal','goto','pick-location','close-modal','confirm-yes','confirm-no','integration-action','img-search'].includes(act)){
        return; // Dejar que otros handlers los procesen
      }
      // product / business / job open
      if(act==='open-product'){ openProduct(b.dataset.id); }
      else if(act==='open-business'){ openBusiness(b.dataset.id); }
      else if(act==='open-job'){ openJob(b.dataset.id); }
      else if(act==='fav-toggle'){ toggleFav(b.dataset.id); }
      else if(act==='profile-open'){ renderProfile(b.dataset.tab||'dash'); LJ.closeAllModals(); openModal('mdProfile'); }
      else if(act==='panel-open'){ renderPanel(b.dataset.tab||'dash'); LJ.closeAllModals(); openModal('mdPanel'); }
      else if(act==='analytics-open'){ LJ.app?.renderAnalytics?.(); LJ.closeAllModals(); openModal('mdAnalytics'); }
      else if(act==='webhook-log-open'){ LJ.app?.renderWebhooks?.(); LJ.closeAllModals(); openModal('mdWebhook'); }
      else if(act==='open-biz-modal'){ LJ.closeAllModals(); openModal('bizModal'); }
    });
  }

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded',()=>{
    renderCatChips();
    initFilters();
    renderCatalog();
    initCartHandlers();
    initDirectory();
    initJobs();
    initJobApply();
    initBizModal();
    initOrders();
    initCheckout();
    initGlobalHandlers();
    updateCartUI();
    renderCartMini();
  });

  /* ---------- EXPORT ---------- */
  window.LJ = window.LJ || {};
  Object.assign(window.LJ, {
    commerce: {
      renderCatalog, search, openProduct, openBusiness, openJob,
      addToCart, changeQty, removeFromCart, clearCart,
      cartSubtotal, cartCount, getCart,
      renderCartMini, renderCartFull,
      toggleFav, renderFavs,
      startCheckout, renderCheckout,
      renderOrders, openOrderDetail,
      renderDirectory, renderJobs,
      renderProfile, renderProfileTab,
      renderPanel, renderPanelTab,
      applyCoupon
    }
  });
})();
