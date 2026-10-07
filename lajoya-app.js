/* ============================================================
   LA JOYA · APP — auth, chat Joya AI, analytics, webhooks,
   cookie bar, welcome popup, contact form, biz map picker
   Depende de: window.LJ (core + commerce)
   ============================================================ */
(function(){
  "use strict";
  const { DATA, store, $, $$, esc, fmt, money, toast, openModal, closeModal, confirm } = window.LJ;

  /* ---------- AUTH ---------- */
  const DEMO_USERS = [
    {id:'u1',name:'Vecino Demo',email:'vecino@lajoya.pe',pass:'demo123',role:'vecino',phone:'954000000'},
    {id:'u2',name:'Negocio Demo',email:'negocio@lajoya.pe',pass:'demo123',role:'negocio',phone:'954111111',bizName:'Quesería La Joya'},
    {id:'u3',name:'Administrador Municipal',email:'admin@lajoya.pe',pass:'demo123',role:'admin',phone:'954000001',bizName:'Municipalidad Distrital de La Joya'}
  ];

  function initAuth(){
    // account popover
    const acctBtn = $('#acctBtn');
    const acctPop = $('#acctPop');
    if(acctBtn && acctPop){
      acctBtn.addEventListener('click',(e)=>{
        e.stopPropagation();
        renderAcctPop();
        acctPop.classList.toggle('show');
      });
    }
    // auth tab switching
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="auth-tab"]'); if(!b) return;
      $$('[data-action="auth-tab"]').forEach(x=>x.classList.toggle('on',x===b));
      $$('.auth-pane').forEach(p=>p.classList.remove('on'));
      $('#'+(b.dataset.tab==='login'?'authLogin':'authRegister')).classList.add('on');
    });
    // login submit
    $('#authLogin')?.addEventListener('submit',(e)=>{
      e.preventDefault();
      const email = $('#authEmail').value.trim();
      const pass = $('#authPass').value;
      const err = $('#authErr');
      const allUsers = [...DEMO_USERS, ...store.get('users',[])];
      const u = allUsers.find(x=>x.email===email && x.pass===pass);
      if(!u){ err.textContent='Credenciales incorrectas. Prueba: vecino@lajoya.pe / negocio@lajoya.pe / admin@lajoya.pe · clave: demo123'; err.className='form-msg err'; return; }
      login(u);
    });
    // register submit
    $('#authRegister')?.addEventListener('submit',(e)=>{
      e.preventDefault();
      const name = $('#regName').value.trim();
      const email = $('#regEmail').value.trim();
      const phone = $('#regPhone').value.trim();
      const pass = $('#regPass').value;
      const role = $('#regRole').value;
      const bizName = $('#regBizName').value.trim();
      const err = $('#regErr');
      if(!name||!email||!pass){ err.textContent='Completa los campos obligatorios (*).'; err.className='form-msg err'; return; }
      if(pass.length<6){ err.textContent='La contraseña debe tener al menos 6 caracteres.'; err.className='form-msg err'; return; }
      if(phone && phone.length!==9){ err.textContent='El celular debe tener 9 dígitos.'; err.className='form-msg err'; return; }
      const users = store.get('users',[]);
      const allUsers = [...DEMO_USERS, ...users];
      if(allUsers.some(u=>u.email===email)){ err.textContent='Ya existe una cuenta con ese correo.'; err.className='form-msg err'; return; }
      const u = {id:'u'+Date.now(),name,email,pass,phone,role,bizName,createdAt:new Date().toISOString()};
      users.push(u); store.set('users',users);
      login(u);
    });
    // demo logins
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="login-demo"]'); if(!b) return;
      const u = DEMO_USERS.find(x=>x.role===b.dataset.role);
      if(u) login(u);
    });
    // logout
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="logout"]'); if(!b) return;
      store.del('user'); updateAcctUI(); toast('Sesión cerrada','info');
      LJ.closeAllModals();
    });
    updateAcctUI();
  }
  function login(u){
    store.set('user', {id:u.id,name:u.name,email:u.email,role:u.role,phone:u.phone||'',bizName:u.bizName||''});
    LJ.closeAllModals();
    toast('¡Bienvenido, '+u.name+'!','ok');
    updateAcctUI();
  }
  function renderAcctPop(){
    const pop = $('#acctPop');
    const u = store.get('user',null);
    if(u){
      pop.innerHTML = `
        <h5>Hola, ${esc(u.name.split(' ')[0])}!</h5>
        <div style="display:grid;gap:6px">
          <button class="pop-item" data-action="profile-open" data-tab="dash"><i class="cdot"></i>Mi perfil</button>
          <button class="pop-item" data-action="orders-open"><i class="cdot"></i>Mis pedidos</button>
          <button class="pop-item" data-action="favs-open"><i class="cdot"></i>Mis favoritos</button>
          ${u.role==='negocio'?`<button class="pop-item" data-action="panel-open" data-tab="dash"><i class="cdot"></i>Panel de mi negocio</button>`:''}
          <button class="pop-item" data-action="logout" style="color:var(--rose)"><i class="cdot" style="background:var(--rose)"></i>Cerrar sesión</button>
        </div>
      `;
    }else{
      pop.innerHTML = `
        <h5>Identifícate</h5>
        <p style="text-align:center;font-size:.8rem;color:var(--ink-3);margin:6px 0 12px">Accede a tu cuenta para gestionar pedidos y favoritos.</p>
        <button class="btn btn-solid" data-action="auth-open" style="width:100%;justify-content:center">Ingresar / Crear cuenta</button>
      `;
    }
  }
  function updateAcctUI(){
    const u = store.get('user',null);
    const label = $('#acctLabel');
    if(label){
      if(u){
        label.innerHTML = 'Hola, '+esc(u.name.split(' ')[0])+'<br><b>Mi cuenta</b>';
      }else{
        label.innerHTML = '¡Bienvenido!<br><b>Identifícate</b>';
      }
    }
  }
  function openAuth(){
    LJ.closeAllModals(); openModal('mdAuth');
  }

  /* ---------- CONTACT FORM ---------- */
  function initContact(){
    const form = $('#contactForm'); if(!form) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const name = $('#cName').value.trim();
      const email = $('#cEmail').value.trim();
      const msg = $('#cMsg').value.trim();
      const err = $('#cMsgErr');
      if(!name||!email||!msg){ err.textContent='Completa todos los campos.'; err.className='form-msg err'; return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent='Email inválido.'; err.className='form-msg err'; return; }
      logWebhook({event:'contact.message', name, email, msg:msg.slice(0,80), at:new Date().toISOString()});
      err.textContent='¡Mensaje enviado! Te responderemos pronto.'; err.className='form-msg ok';
      form.reset();
      toast('Mensaje enviado','ok');
    });
  }

  /* ---------- POPUP / COOKIE ---------- */
  function initPopup(){
    const shown = store.get('popupShown',false);
    if(!shown){
      setTimeout(()=>{
        openModal('popup');
        store.set('popupShown',true);
      },6000);
    }
    const form = $('#popForm');
    if(form) form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const email = $('#popEmail').value.trim();
      const err = $('#popErr');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.textContent='Email inválido.'; err.className='form-msg err'; return; }
      err.textContent='¡Listo! Te enviaremos la guía de La Joya.'; err.className='form-msg ok';
      toast('¡Bienvenido a La Joya!','ok');
      setTimeout(()=>LJ.closeModal('popup'),1500);
    });
  }
  function initCookie(){
    const bar = $('#cookieBar');
    if(!bar) return;
    // Si ya aceptó antes, mantener oculto
    if(store.get('cookieOk',false)){
      bar.hidden = true;
      bar.style.display = 'none';
    } else {
      bar.hidden = false;
      bar.style.display = 'flex';
    }
    // Función para ocultar definitivamente
    const hideBar = () => {
      store.set('cookieOk', true);
      bar.hidden = true;
      bar.style.display = 'none';
      toast('Preferencias guardadas', 'ok');
    };
    // Listener directo en el botón Aceptar
    const acceptBtn = bar.querySelector('.btn-solid');
    if(acceptBtn){
      acceptBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        hideBar();
      });
    }
    // Listener en el botón × (cerrar)
    const closeBtn = bar.querySelector('.cookie-x');
    if(closeBtn){
      closeBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        hideBar();
      });
    }
    // Listener global de respaldo
    document.addEventListener('click', (e)=>{
      if(e.target.closest('[data-action="cookie-accept"]')){
        e.preventDefault();
        e.stopPropagation();
        hideBar();
      }
    }, true);
  }

  /* ---------- WEBHOOKS ---------- */
  function logWebhook(event){
    const log = store.get('webhooks',[]);
    log.unshift({...event, _id:'w'+Date.now()});
    if(log.length>50) log.length=50;
    store.set('webhooks',log);
  }
  function renderWebhooks(){
    const body = $('#whBody'); if(!body) return;
    const log = store.get('webhooks',[]);
    body.innerHTML = `
      <div class="m-form">
        <span class="label">Registro de webhooks</span>
        <h3>Eventos recibidos por la plataforma</h3>
        <p>Log local de todos los eventos (pedidos, postulaciones, registros, etc.). Solo demostración.</p>
        ${log.length===0?'<p style="color:var(--ink-3);padding:14px;text-align:center">Sin eventos todavía.</p>':
        '<div class="panel-table"><table><thead><tr><th>Evento</th><th>Detalle</th><th>Fecha</th></tr></thead><tbody>'+
        log.map(w=>`<tr><td><b>${esc(w.event)}</b></td><td style="font-size:.78rem;color:var(--ink-3)">${esc(JSON.stringify({...w,event:undefined,_id:undefined}))}</td><td style="font-size:.78rem">${new Date(w.at).toLocaleString('es-PE')}</td></tr>`).join('')+
        '</tbody></table></div>'}
        <button class="btn btn-ghost" data-action="clear-webhooks" style="margin-top:14px">Borrar log</button>
      </div>
    `;
    body.querySelector('[data-action="clear-webhooks"]')?.addEventListener('click',()=>{
      store.set('webhooks',[]); renderWebhooks(); toast('Log borrado','info');
    });
  }

  /* ---------- ANALYTICS ---------- */
  function renderAnalytics(){
    const body = $('#anBody'); if(!body) return;
    const orders = store.get('orders',[]);
    const users = store.get('users',[]).length + DEMO_USERS.length;
    const apps = store.get('apps',[]);
    const webhooks = store.get('webhooks',[]);
    const totalSales = orders.reduce((s,o)=>s+o.total,0);
    const avgTicket = orders.length>0 ? totalSales/orders.length : 0;
    const byCat = {};
    orders.forEach(o=>o.items.forEach(i=>{
      const p = DATA.productos.find(x=>x.id===i.id);
      if(p){ byCat[p.cat]=(byCat[p.cat]||0)+p.precio*i.qty; }
    }));
    const maxCat = Math.max(1,...Object.values(byCat));
    body.innerHTML = `
      <div class="m-form">
        <span class="label">Analítica de La Joya</span>
        <h3>Indicadores del distrito</h3>
        <p>Datos en tiempo real basados en la actividad de la plataforma (modo demo).</p>
      </div>
      <div class="analytics-grid">
        <div class="an-card"><b>${orders.length}</b><span>Pedidos procesados</span></div>
        <div class="an-card"><b>S/ ${fmt(totalSales)}</b><span>Ventas totales (PEN)</span></div>
        <div class="an-card"><b>S/ ${fmt(avgTicket)}</b><span>Ticket promedio</span></div>
        <div class="an-card"><b>${users}</b><span>Usuarios registrados</span></div>
        <div class="an-card"><b>${apps.length}</b><span>Postulaciones a empleos</span></div>
        <div class="an-card"><b>${DATA.negocios.length}</b><span>Negocios en el directorio</span></div>
        <div class="an-card"><b>${DATA.productos.length}</b><span>Productos publicados</span></div>
        <div class="an-card"><b>${webhooks.length}</b><span>Eventos webhook</span></div>
      </div>
      <div class="an-chart">
        <div class="panel-chart">
          <h4>Ventas por categoría</h4>
          <div class="chart-bars">
            ${Object.entries(byCat).map(([cat,val])=>`<div class="chart-bar" style="height:${(val/maxCat)*100}%" title="${esc(cat)}: S/ ${fmt(val)}"><small>${esc(cat)}</small></div>`).join('') || '<p style="color:var(--ink-3);text-align:center;padding:20px">Sin ventas todavía</p>'}
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- BIZ MAP PICKER ---------- */
  let pickerMap = null;
  let pickerMarker = null;
  let pickerTargets = null;
  function openBizMap(latSel,lngSel){
    pickerTargets = {lat:latSel,lng:lngSel};
    LJ.closeAllModals();
    $('#mdMapTitle').textContent = 'Selecciona la ubicación de tu negocio';
    $('#mdMapHint').textContent = 'Toca el mapa o arrastra el marcador para elegir la ubicación exacta.';
    openModal('mdMap');
    setTimeout(()=>{
      if(typeof L==='undefined'){ toast('Leaflet no disponible','err'); return; }
      if(pickerMap){ pickerMap.remove(); pickerMap=null; }
      pickerMap = L.map('mapModalMap',{scrollWheelZoom:true}).setView([-16.3436,-71.8521],14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:19}).addTo(pickerMap);
      const initLat = parseFloat($(latSel).value)||-16.3436;
      const initLng = parseFloat($(lngSel).value)||-71.8521;
      pickerMarker = L.marker([initLat,initLng],{draggable:true}).addTo(pickerMap);
      pickerMarker.bindPopup('📍 Tu negocio aquí').openPopup();
      pickerMarker.on('dragend',()=>{
        const ll = pickerMarker.getLatLng();
        $(latSel).value = ll.lat.toFixed(6);
        $(lngSel).value = ll.lng.toFixed(6);
      });
      pickerMap.on('click',(e)=>{
        pickerMarker.setLatLng(e.latlng);
        $(latSel).value = e.latlng.lat.toFixed(6);
        $(lngSel).value = e.latlng.lng.toFixed(6);
      });
      setTimeout(()=>pickerMap.invalidateSize(),200);
    },200);
  }
  function openBizMap(id){
    const b = DATA.negocios.find(x=>x.id===id);
    if(!b) return;
    LJ.closeAllModals();
    $('#mdMapTitle').textContent = b.nombre;
    $('#mdMapHint').textContent = b.dir+' · '+b.horario;
    openModal('mdMap');
    setTimeout(()=>{
      if(typeof L==='undefined'){ toast('Leaflet no disponible','err'); return; }
      if(pickerMap){ pickerMap.remove(); pickerMap=null; }
      pickerMap = L.map('mapModalMap',{scrollWheelZoom:true}).setView([b.lat,b.lng],15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:19}).addTo(pickerMap);
      pickerMarker = L.marker([b.lat,b.lng]).addTo(pickerMap);
      pickerMarker.bindPopup(`<b>${esc(b.nombre)}</b><br>${esc(b.dir)}`).openPopup();
      setTimeout(()=>pickerMap.invalidateSize(),200);
    },200);
  }
  // Reset map when modal closes
  document.addEventListener('click',(e)=>{
    if(e.target.closest('#mdMap [data-close]')){
      if(pickerMap){ setTimeout(()=>{ pickerMap.remove(); pickerMap=null; },200); }
    }
  });

  /* ---------- JOYA AI CHAT ---------- */
  const CHAT_QUICK = [
    '¿Qué productos tienen?',
    '¿Cómo funciona el delivery?',
    '¿Dónde está La Joya?',
    'Ver empleos disponibles',
    'Tarifa de mototaxi',
    'Publicar mi negocio'
  ];
  function initChat(){
    const fab = $('#chatFab');
    const panel = $('#chatPanel');
    const form = $('#chatForm');
    const input = $('#chatInput');
    const body = $('#chatBody');
    const quick = $('#chatQuick');
    if(!fab||!panel||!form||!input||!body||!quick) return;
    // Usar onclick directo (sobrescribe cualquier handler previo) para garantizar que funcione
    fab.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
      return false;
    };
    // También registrar con addEventListener con capture
    fab.addEventListener('click',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    }, true);
    $$('[data-action="chat-toggle"]').forEach(b=>{
      b.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleChat();
        return false;
      };
    });
    // Handler global para chat-open (botones que abren el chat con pregunta inicial)
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action="chat-open"]'); if(!b) return;
      e.preventDefault();
      e.stopPropagation();
      const q = b.dataset.q;
      openChat(q);
    });
    quick.innerHTML = CHAT_QUICK.map(q=>`<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('');
    quick.addEventListener('click',(e)=>{
      const b = e.target.closest('button[data-q]'); if(!b) return;
      input.value = b.dataset.q; form.requestSubmit();
    });
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const q = input.value.trim();
      if(!q) return;
      addMsg('user', q);
      input.value='';
      // Mostrar indicador de "escribiendo..."
      const typing = document.createElement('div');
      typing.className = 'chat-msg bot';
      typing.innerHTML = '<span style="opacity:.6">Escribiendo...</span>';
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;
      setTimeout(()=>{
        typing.remove();
        const a = answer(q);
        addMsg('bot', a.html, a.title);
        // Actualizar botones de acceso rápido con sugerencias dinámicas
        if (a.suggestions) updateQuickButtons(a.suggestions);
      }, 700 + Math.random()*400);
      body.scrollTop = body.scrollHeight;
    });
    if(body.children.length===0){
      addMsg('bot', {html:'Saludos cordiales. Soy <b>Joya AI</b>, el asistente virtual del distrito de La Joya, Arequipa. Estoy a tu entera disposición para asistirte en las siguientes áreas:<ul style="margin-top:8px"><li><b>Comercio</b> — catálogo de productos y directorio de negocios</li><li><b>Empleo</b> — vacantes locales y postulaciones</li><li><b>Transporte</b> — tarifas y rutas referenciales</li><li><b>Trámites municipales</b> — horarios y atención al ciudadano</li><li><b>Turismo</b> — lugares, tours y eventos del distrito</li></ul><p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">¿En qué materia puedo orientarte el día de hoy?</p>'}, 'Joya AI');
    }
  }
  function toggleChat(){
    // Si hay modales abiertos, cerrarlos primero y ABRIR el chat en el mismo clic
    const openModals = $$('.modal.open');
    if(openModals.length > 0){
      openModals.forEach(m => m.classList.remove('open'));
      document.body.style.overflow = '';
      // Abrir chat automáticamente
      const panel = $('#chatPanel');
      const fab = $('#chatFab');
      panel.classList.add('open');
      fab.style.display = 'none';
      const body = $('#chatBody');
      body.scrollTop = body.scrollHeight;
      return;
    }
    // Cerrar cookie bar si está visible
    const cookieBar = $('#cookieBar');
    if(cookieBar && !cookieBar.hidden){
      store.set('cookieOk', true);
      cookieBar.hidden = true;
      cookieBar.style.display = 'none';
    }
    const panel = $('#chatPanel');
    const fab = $('#chatFab');
    const open = panel.classList.toggle('open');
    fab.style.display = open ? 'none' : '';
    if(open){
      const body = $('#chatBody');
      body.scrollTop = body.scrollHeight;
    }
  }
  function openChat(initialQ){
    const panel = $('#chatPanel');
    panel.classList.add('open');
    $('#chatFab').style.display='none';
    if(initialQ){
      $('#chatInput').value = initialQ;
      $('#chatForm').requestSubmit();
    }
  }
  function addMsg(type, content, title){
    const body = $('#chatBody');
    const div = document.createElement('div');
    div.className = 'chat-msg '+type;
    if(type==='bot'){
      div.innerHTML = (title?'<b>'+esc(title)+'</b>':'') + (content.html||content);
    }else{
      div.textContent = content;
    }
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
  /* ============================================================
     JOYA AI · Sistema de respuesta inteligente
     - Análisis de intención por scoring (no solo regex)
     - Memoria de contexto (últimos 3 turnos)
     - Base de conocimiento ampliada (15+ temas)
     - Tono formal e institucional
     - Sugerencias dinámicas según la intención
     ============================================================ */

  const CHAT_CONTEXT = {
    history: [],          // últimas intenciones detectadas
    lastIntent: null,
    lastProductCat: null,
    lastJobCat: null,
    userName: null
  };

  // Base de conocimiento: cada intención tiene palabras clave con peso
  const INTENTS = [
    {
      id: 'saludo',
      keywords: {'hola':3, 'buenas':3, 'buenos dias':3, 'buenas tardes':3, 'buenas noches':3, 'saludos':3, 'hey':1, 'que tal':2, 'como estas':2, 'que onda':1},
      minScore: 2,
      suggestions: ['Ver catálogo', 'Buscar negocios', 'Empleos disponibles'],
      handler: () => ({
        html: `Saludos cordiales. Soy <b>Joya AI</b>, el asistente virtual del distrito de La Joya, Arequipa. Estoy a tu entera disposición para asistirte en las siguientes áreas:
        <ul style="margin-top:8px">
          <li><b>Comercio</b> — catálogo de productos y directorio de negocios</li>
          <li><b>Empleo</b> — vacantes locales y postulaciones</li>
          <li><b>Transporte</b> — tarifas y rutas referenciales</li>
          <li><b>Trámites municipales</b> — horarios, requisitos y atención al ciudadano</li>
          <li><b>Turismo</b> — lugares, tours y eventos del distrito</li>
          <li><b>Información general</b> — clima, historia y datos del valle</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">¿En qué materia puedo orientarte el día de hoy?</p>`
      })
    },
    {
      id: 'despedida',
      keywords: {'chau':3, 'adios':3, 'hasta luego':3, 'nos vemos':3, 'bye':3, 'me voy':3, 'gracias y adios':3},
      minScore: 2,
      handler: () => ({
        html: `Ha sido un gusto asistirte. Recuerda que la <b>Municipalidad Distrital de La Joya</b> pone a tu disposición este portal las 24 horas, todos los días. Que tengas una excelente jornada en el valle. 🌵`
      })
    },
    {
      id: 'agradecimiento',
      keywords: {'gracias':3, 'muchas gracias':3, 'thank you':3, 'thanks':3, 'te agradezco':3, 'mil gracias':3, 'perfecto':1, 'genial':1, 'excelente':2},
      minScore: 2,
      handler: () => ({
        html: `Es un placer haberte sido de utilidad. Si surge alguna otra consulta, no dudes en consultarme. Estoy disponible para atenderte cuando lo necesites.`
      })
    },
    {
      id: 'productos',
      keywords: {'producto':3, 'productos':3, 'catalogo':3, 'catálogo':3, 'comprar':2, 'compra':2, 'tienda':2, 'tiendas':2, 'precio':2, 'precios':2, 'cuanto cuesta':2, 'articulo':1, 'artículos':1, 'venden':2, 'vender':1},
      minScore: 2,
      suggestions: ['Ver ofertas', 'Buscar negocios', 'Cómo comprar'],
      handler: (q) => {
        // Si menciona categoría específica
        const cats = {comida:'comida', mercado:'mercados', agricola:'agricola', agricultura:'agricola', queso:'mercados', paprika:'agricola', leche:'agricola', cerveza:'comida', pan:'comida', gas:'servicios', ferreteria:'ferreteria', tech:'tech', celular:'tech', zapatos:'moda', polera:'moda'};
        let catFound = null;
        for (const k in cats) { if (q.toLowerCase().includes(k)) { catFound = cats[k]; break; } }
        let productos = DATA.productos;
        if (catFound) {
          productos = productos.filter(p => p.cat === catFound);
          CHAT_CONTEXT.lastProductCat = catFound;
        } else if (CHAT_CONTEXT.lastProductCat) {
          productos = productos.filter(p => p.cat === CHAT_CONTEXT.lastProductCat);
        }
        const limit = Math.min(6, productos.length);
        const items = productos.slice(0, limit);
        if (items.length === 0) return {
          html: `No se encontraron productos en esa categoría. El catálogo del distrito comprende <b>${DATA.productos.length} productos</b> distribuidos en 10 categorías: comida, mercados, agrícola, servicios, salud, transporte, turismo, ferretería, moda y tecnología. ¿Deseas explorar alguna en particular?`
        };
        const total = DATA.productos.length;
        return {
          html: `El catálogo del distrito de La Joya reúne <b>${total} productos</b>${catFound?` en la categoría <b>${catFound}</b>`:''}. A continuación te muestro los más relevantes:
          <ul style="margin-top:8px">${items.map(p => `
            <li><b>${esc(p.nombre)}</b> — ${money(p.precio)}${p.oferta?` <small style="color:var(--leaf)">(oferta, antes ${money(p.precioOld)})</small>`:''}<br><small style="color:var(--ink-3)">${esc(p.negocio)} · ${esc(p.zona)} · ${p.stock>0?`${p.stock} en stock`:'<span style="color:var(--rose)">agotado</span>'}</small></li>
          `).join('')}</ul>
          <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Para ver el catálogo completo, desplázate hasta la sección "Catálogo de La Joya" donde podrás aplicar filtros por categoría, zona, precio y calificación.</p>`
        };
      }
    },
    {
      id: 'negocios',
      keywords: {'negocio':3, 'negocios':3, 'directorio':3, 'tienda':1, 'tiendas':1, 'empresa':2, 'empresas':2, 'comercio':2, 'comercios':2, 'donde comprar':3, 'donde encontrar':2, 'establecimiento':2},
      minScore: 2,
      suggestions: ['Publicar mi negocio', 'Restaurantes', 'Farmacias'],
      handler: (q) => {
        const cats = {comida:'comida', restaurante:'comida', picanteria:'comida', panaderia:'comida', mercado:'mercados', bodega:'mercados', farmacia:'salud', botica:'salud', dental:'salud', ferreteria:'ferreteria', transporte:'transporte', mototaxi:'transporte', tour:'turismo', hotel:'turismo', hostal:'turismo', peluqueria:'servicios', barberia:'servicios', tecnologia:'tech', celulares:'tech', moda:'moda', zapatos:'moda'};
        let catFound = null;
        for (const k in cats) { if (q.toLowerCase().includes(k)) { catFound = cats[k]; break; } }
        let negocios = DATA.negocios;
        if (catFound) negocios = negocios.filter(b => b.cat === catFound);
        const items = negocios.slice(0, 6);
        return {
          html: `El directorio distrital registra <b>${DATA.negocios.length} negocios</b> formalmente establecidos${catFound?` en la categoría <b>${catFound}</b>`:''}. Los principales son:
          <ul style="margin-top:8px">${items.map(b => `
            <li><b>${esc(b.nombre)}</b><br><small style="color:var(--ink-3)">${esc(b.zona)} · ★ ${b.rating} · ${esc(b.horario)}</small></li>
          `).join('')}</ul>
          <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Cada ficha contiene dirección exacta, teléfono, WhatsApp directo y ubicación en el mapa interactivo del distrito.</p>`
        };
      }
    },
    {
      id: 'delivery',
      keywords: {'delivery':3, 'envio':3, 'envío':3, 'reparto':3, 'repartir':2, 'entrega':2, 'entregar':2, 'domicilio':3, 'a casa':2, 'lo llevan':2, 'lo traen':2},
      minScore: 2,
      suggestions: ['Tarifas de transporte', 'Ver productos', 'Carrito'],
      handler: () => ({
        html: `El servicio de <b>delivery local</b> está disponible en todo el distrito de La Joya con las siguientes condiciones:
        <ul style="margin-top:8px">
          <li><b>Costo fijo:</b> S/ 8.00 por pedido, sin importar el número de productos</li>
          <li><b>Tiempo estimado:</b> 30 a 60 minutos según la zona y el horario</li>
          <li><b>Cobertura:</b> Centro, Cruce La Joya, La Yarada, Pampa Siguas, La Florida y zonas aledañas</li>
          <li><b>Horario:</b> Lunes a sábado de 8:00 a 22:00, domingos hasta las 14:00</li>
          <li><b>Recojo en tienda:</b> gratuito, disponible en todos los negocios del directorio</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">El pago puede realizarse en efectivo contra entrega, con tarjeta o mediante Yape/Plin, según el comercio.</p>`
      })
    },
    {
      id: 'empleos',
      keywords: {'empleo':3, 'empleos':3, 'trabajo':3, 'trabajos':3, 'vacante':3, 'vacantes':3, 'postul':2, 'convoc':2, 'puesto':2, 'cargo':2, 'contratar':2, 'busco trabajo':3, 'oferta laboral':3},
      minScore: 2,
      suggestions: ['Postular', 'Empleos por categoría', 'Trámites'],
      handler: (q) => {
        const cats = {chofer:'transporte', chofer:'transporte', agricultor:'agricultura', agrícola:'agricultura', vendedor:'comercio', vendedora:'comercio', cocinera:'servicios', barbero:'servicios', tecnico:'servicios', celulares:'servicios', estado:'estado', cas:'estado', municipal:'estado', guia:'turismo', turistico:'turismo'};
        let catFound = null;
        for (const k in cats) { if (q.toLowerCase().includes(k)) { catFound = cats[k]; break; } }
        let empleos = DATA.empleos;
        if (catFound) {
          empleos = empleos.filter(j => j.cat === catFound);
          CHAT_CONTEXT.lastJobCat = catFound;
        }
        const items = empleos.slice(0, 6);
        return {
          html: `La bolsa de trabajo del distrito presenta <b>${DATA.empleos.length} vacantes activas</b>${catFound?` en <b>${catFound}</b>`:''}, ofrecidas por negocios locales y la municipalidad:
          <ul style="margin-top:8px">${items.map(j => `
            <li><b>${esc(j.titulo)}</b> — ${esc(j.empresa)}<br><small style="color:var(--ink-3)">S/ ${fmt(j.salario)}/mes · ${esc(j.tipo)} · ${esc(j.zona)}</small></li>
          `).join('')}</ul>
          <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Para postular, dirígete a la sección "Trabajo" y pulsa "Postular" en la vacante de tu interés. Recibirás confirmación vía WhatsApp o correo electrónico.</p>`
        };
      }
    },
    {
      id: 'transporte',
      keywords: {'transporte':3, 'pasaje':3, 'tarifa':3, 'tarifas':3, 'bus':3, 'buses':3, 'mototaxi':3, 'colectivo':3, 'minivan':3, 'ruta':2, 'rutas':2, 'viaje':2, 'como llegar':3, 'llegar a':2},
      minScore: 2,
      suggestions: ['Calcular pasaje', 'Tarifas vigentes', 'Empleos'],
      handler: () => ({
        html: `Las tarifas referenciales vigentes para el transporte desde y hacia La Joya son las siguientes:
        <ul style="margin-top:8px">
          <li><b>Arequipa → La Joya:</b> S/ 8.00 (bus) · S/ 12.00 (colectivo) · S/ 15.00 (minivan)</li>
          <li><b>La Joya → La Yarada:</b> S/ 3.00 (bus) · S/ 5.00 (colectivo)</li>
          <li><b>La Joya → Majes:</b> S/ 10.00 (bus) · S/ 15.00 (colectivo)</li>
          <li><b>La Joya → Villa El Pedregal:</b> S/ 6.00 (bus) · S/ 9.00 (colectivo)</li>
          <li><b>Mototaxi urbano:</b> S/ 2.00 a S/ 5.00 según distancia, dentro del distrito</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Estas tarifas pueden incrementarse entre S/ 1.00 y S/ 2.00 en horarios nocturnos y fechas festivas. Para cálculos personalizados, utiliza la herramienta "Calcula tu pasaje" en la sección Transporte.</p>`
      })
    },
    {
      id: 'publicar_negocio',
      keywords: {'publicar':3, 'publica':3, 'registrar negocio':3, 'registro negocio':3, 'vender':2, 'poner negocio':3, 'abrir negocio':3, 'dar de alta':3, 'mi negocio':2, 'anunciar':2, 'anuncio':2},
      minScore: 2,
      suggestions: ['Requisitos', 'Panel de negocio', 'Contacto'],
      handler: () => ({
        html: `El proceso para publicar tu negocio en el portal distrital es el siguiente:
        <ol style="margin-top:8px">
          <li><b>Accede al formulario:</b> pulsa "Publica tu negocio" en el menú principal o en el pie de página</li>
          <li><b>Completa los datos</b> del establecimiento: nombre, rubro, descripción, dirección, teléfonos, horario y coordenadas geográficas (puedes seleccionarlas en el mapa interactivo)</li>
          <li><b>Crea una contraseña</b> para gestionar tu panel privado (mínimo 6 caracteres)</li>
          <li><b>Verificación municipal:</b> la Municipalidad Distrital de La Joya verifica la información en un plazo máximo de <b>48 horas hábiles</b></li>
          <li><b>Publicación:</b> una vez aprobado, tu negocio aparece automáticamente en el directorio y en el mapa interactivo</li>
        </ol>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">El registro es completamente gratuito para todos los negocios formalmente establecidos en el distrito. Una vez publicado, tendrás acceso a un panel de gestión donde podrás administrar productos, consultar pedidos y visualizar estadísticas de ventas.</p>`
      })
    },
    {
      id: 'ubicacion',
      keywords: {'donde':3, 'dónde':3, 'ubicacion':3, 'ubicación':3, 'mapa':3, 'coordenadas':3, 'direccion':2, 'dirección':2, 'como llegar':3, 'llegar':2, 'distancia':2, 'donde queda':3, 'ubicado':3},
      minScore: 2,
      suggestions: ['Ver mapa', 'Transporte', 'Lugares turísticos'],
      handler: () => ({
        html: `El distrito de La Joya se encuentra ubicado en la <b>provincia de Arequipa, región Arequipa, Perú</b>, en el corazón del valle interandino del mismo nombre. Sus datos geográficos son:
        <ul style="margin-top:8px">
          <li><b>Coordenadas:</b> latitud −16.3436, longitud −71.8521</li>
          <li><b>Altitud:</b> aproximadamente 1,250 metros sobre el nivel del mar</li>
          <li><b>Distancia a Arequipa metropolitana:</b> 45 minutos por la Panamericana Sur (aprox. 50 km)</li>
          <li><b>Acceso principal:</b> Carretera Panamericana Sur, km 845</li>
          <li><b>Límites:</b> al norte con el distrito de Cerro Colorado, al sur con La Yarada, al este con Pampa Siguas y al oeste con el desierto costero</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Para visualizar la ubicación exacta de negocios, lugares turísticos y servicios, dirígete a la sección "Mapa" donde encontrarás un mapa interactivo con marcadores categorizados.</p>`
      })
    },
    {
      id: 'clima',
      keywords: {'clima':3, 'temperatura':3, 'tiempo':2, 'lluvia':2, 'llueve':2, 'sol':2, 'calor':2, 'frio':2, 'frío':2, 'estacion':2, 'estación':2, 'verano':2, 'invierno':2},
      minScore: 2,
      suggestions: ['Datos del distrito', 'Turismo', 'Lugares'],
      handler: () => ({
        html: `El clima del distrito de La Joya se clasifica como <b>árido desértico de baja latitud</b>, con las siguientes características generales:
        <ul style="margin-top:8px">
          <li><b>Temperatura promedio anual:</b> 14°C a 24°C</li>
          <li><b>Temperatura máxima:</b> 28°C en verano (diciembre a marzo)</li>
          <li><b>Temperatura mínima:</b> 6°C en invierno (junio a agosto), con heladas ocasionales en zonas rurales</li>
          <li><b>Precipitaciones:</b> escasas, concentradas entre enero y marzo (80 a 150 mm anuales)</li>
          <li><b>Humedad relativa:</b> 45% a 65%</li>
          <li><b>Insolación:</b> más de 300 días soleados al año</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">La temperatura actual del valle se muestra en el encabezado superior del portal, actualizada en tiempo real mediante la API de Open-Meteo.</p>`
      })
    },
    {
      id: 'tramites',
      keywords: {'tramite':3, 'trámite':3, 'documentos':2, 'documento':2, 'municipal':3, 'municipio':3, 'servir':3, 'reniec':3, 'sunat':2, 'licencia':3, 'libreta':2, 'partida':2, 'ruc':3, 'dni':3, 'cita':2, 'ventanilla':3},
      minScore: 2,
      suggestions: ['Horarios', 'Contacto municipal', 'Agenda distrital'],
      handler: () => ({
        html: `La <b>Ventanana de Atención al Ciudadano</b> de la Municipalidad Distrital de La Joya opera en Plaza de Armas s/n, con el siguiente horario:
        <ul style="margin-top:8px">
          <li><b>Lunes a viernes:</b> 8:00 a. m. a 4:00 p. m.</li>
          <li><b>Sábados (módulo SERVIR):</b> 8:00 a. m. a 1:00 p. m.</li>
          <li><b>Domingos:</b> cerrado (funciona la feria dominical)</li>
        </ul>
        <p style="margin-top:8px"><b>Trámites más solicitados:</b></p>
        <ul>
          <li>Libreta sanitaria (manipulador de alimentos)</li>
          <li>Licencia de funcionamiento provisional y definitiva</li>
          <li>Partida de nacimiento, matrimonio y defunción</li>
          <li>Certificado de obra menor y licencia de edificación</li>
          <li>Orientación Legal Gratuita (OLP) — SERVIR sábados</li>
          <li>Constancia de no adeudar al municipio</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Para agendar trámites específicos, puedes pulsar el botón "Agendar un trámite" en la sección "¿Qué pasa en La Joya?" y un funcionario municipal te contactará.</p>`
      })
    },
    {
      id: 'feria',
      keywords: {'feria':3, 'dominical':3, 'evento':2, 'eventos':2, 'fiesta':2, 'fiestas':2, 'festividad':3, 'expo':2, 'aniversario':3, 'concierto':3, 'agenda':3, 'actividad':2, 'actividades':2},
      minScore: 2,
      suggestions: ['Agenda distrital', 'Lugares turísticos', 'Trámites'],
      handler: () => {
        const agenda = DATA.agenda.slice(0, 4);
        return {
          html: `La <b>Feria Dominical de La Joya</b> es la actividad cultural y comercial más importante del distrito. Se realiza todos los domingos en la Plaza de Armas desde las 6:00 a. m., reuniendo a productores agrícolas, artesanos, comerciantes y vecinos en general.
          <p style="margin-top:8px"><b>Próximos eventos del distrito:</b></p>
          <ul style="margin-top:8px">${agenda.map(a => `
            <li><b>${a.dia} ${a.mes}</b> — ${esc(a.titulo)}<br><small style="color:var(--ink-3)">${esc(a.desc)}</small></li>
          `).join('')}</ul>
          <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">La agenda completa está disponible en la sección "¿Qué pasa en La Joya?" del portal.</p>`
        };
      }
    },
    {
      id: 'turismo',
      keywords: {'tour':3, 'turismo':3, 'turistico':3, 'turístico':3, 'dunas':3, 'oasis':3, 'sandboard':3, 'catarata':3, 'cataratas':3, 'cano':2, 'piscina':3, 'balneario':3, 'paisaje':2, 'aventura':3, 'hospedaje':2, 'hostal':2, 'hotel':2, 'que visitar':3, 'que ver':3},
      minScore: 2,
      suggestions: ['Hospedajes', 'Tours disponibles', 'Mapa'],
      handler: () => {
        const lugares = DATA.lugares.slice(0, 6);
        return {
          html: `El distrito de La Joya ofrece atractivos turísticos únicos en la región Arequipa, combinando desierto, valle irrigado y patrimonio cultural. Los principales atractivos son:
          <ul style="margin-top:8px">${lugares.map(l => `
            <li><b>${esc(l.nombre)}</b> <small style="color:var(--accent)">[${esc(l.cat)}]</small><br><small style="color:var(--ink-3)">${esc(l.desc)}</small></li>
          `).join('')}</ul>
          <p style="margin-top:8px"><b>Servicios turísticos disponibles en el portal:</b></p>
          <ul>
            <li>Alquiler de tablas de sandboard (S/ 35/día)</li>
            <li>Tours guiados al Oasis + Cataratas de La Cano (S/ 65)</li>
            <li>Traslados en 4x4 a las dunas (cupo previa reserva)</li>
            <li>Hospedaje en Hostal El Oasis con desayuno incluido</li>
          </ul>`
        };
      }
    },
    {
      id: 'agricola',
      keywords: {'paprika':3, 'páprika':3, 'cebolla':3, 'aji':2, 'ají':2, 'agricola':3, 'agrícola':3, 'agricultura':3, 'exportacion':3, 'exportación':3, 'aceituna':3, 'oliva':3, 'alfalfa':3, 'maiz':2, 'maíz':2, 'leche':2, 'queso':2, 'miel':2, 'fundo':3, 'valle':2},
      minScore: 2,
      suggestions: ['Productos agrícolas', 'Negocios agrícolas', 'Historia'],
      handler: () => ({
        html: `La Joya es reconocida a nivel nacional como el <b>primer productor peruano de páprika</b> (pimentón dulce deshidratado) destinado a la exportación, principalmente a los mercados de Estados Unidos y la Unión Europea. La actividad agrícola del valle incluye además:
        <ul style="margin-top:8px">
          <li><b>Páprika:</b> 1,200 hectáreas cultivadas, exportación anual de 4,500 toneladas</li>
          <li><b>Cebolla roja arequipeña:</b> 800 hectáreas, comercialización nacional y exportación</li>
          <li><b>Ajíes (panca, amarillo, mirasol):</b> para consumo industrial y exportación</li>
          <li><b>Aceituna y aceite de oliva:</b> olivos centenarios en La Yarada</li>
          <li><b>Alfalfa y maíz:</b> para consumo ganadero y producción láctea</li>
          <li><b>Leche y derivados:</b> quesos frescos, manjar blanco, yogur artesanal</li>
          <li><b>Miel de abeja:</b> apiarios en zonas del desierto florido</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Para adquirir productos agrícolas directamente de los fundos del valle, dirígete al catálogo y filtra por la categoría "Agrícola".</p>`
      })
    },
    {
      id: 'contacto',
      keywords: {'contacto':3, 'whatsapp':3, 'telefono':3, 'teléfono':3, 'correo':3, 'email':3, 'numero':2, 'número':2, 'llamar':3, 'comunicar':2, 'email':3, 'gmail':2, 'outlook':1, 'hotmail':1},
      minScore: 2,
      suggestions: ['Horarios', 'Trámites', 'Ubicación'],
      handler: () => ({
        html: `Los canales de contacto oficiales de la <b>Municipalidad Distrital de La Joya</b> son los siguientes:
        <ul style="margin-top:8px">
          <li><b>Dirección:</b> Plaza de Armas s/n, La Joya, Arequipa</li>
          <li><b>Teléfono fijo:</b> (054) 451-230</li>
          <li><b>Correo electrónico:</b> hola@lajoya.gob.pe</li>
          <li><b>Horario de atención:</b> Lunes a viernes 8:00–16:00 · Sábados 8:00–13:00</li>
          <li><b>Redes sociales:</b> Facebook, Instagram, WhatsApp Business y TikTok</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Cada negocio del directorio tiene además un botón directo de WhatsApp para comunicarte con el establecimiento sin intermediarios.</p>`
      })
    },
    {
      id: 'comprar',
      keywords: {'como comprar':3, 'comprar':3, 'carrito':3, 'checkout':3, 'pago':3, 'pagar':3, 'tarjeta':3, 'yape':3, 'plin':3, 'pedido':3, 'pedidos':3, 'finalizar compra':3, 'orden':2},
      minScore: 2,
      suggestions: ['Productos', 'Delivery', 'Mis pedidos'],
      handler: () => ({
        html: `El proceso de compra en el portal de La Joya es sencillo y seguro. Te explico los pasos a seguir:
        <ol style="margin-top:8px">
          <li><b>Selecciona productos:</b> navega el catálogo y pulsa el botón "+" para agregarlos al carrito</li>
          <li><b>Revisa tu carrito:</b> accede al ícono del carrito (esquina superior derecha) para verificar cantidades y eliminar items si es necesario</li>
          <li><b>Aplica cupones:</b> si tienes un código de descuento (JOYA10, JOYA20, BIENVENIDA), ingrésalo antes de finalizar</li>
          <li><b>Datos de envío:</b> ingresa tu nombre, teléfono, dirección y elige entre delivery (S/ 8) o recojo en tienda (gratis)</li>
          <li><b>Método de pago:</b> selecciona tarjeta (sandbox Culqi), Yape/Plin (QR) o efectivo contra entrega</li>
          <li><b>Confirmación:</b> recibe un código de pedido (formato LJ-XXXXXX) y consulta su estado en "Mis pedidos"</li>
        </ol>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">El portal opera en modo demostración con pasarelas de pago sandbox. No se realizan cobros reales. Para compras efectivas, comunícate directamente con el negocio vía WhatsApp.</p>`
      })
    },
    {
      id: 'historia',
      keywords: {'historia':3, 'fundacion':3, 'fundación':3, 'aniversario':3, 'creacion':3, 'creación':3, 'cuando se fundo':3, 'antiguedad':2, 'patrimonio':2, 'cultura':2, 'tradiciones':2, 'virgen del carmen':3},
      minScore: 2,
      suggestions: ['Lugares turísticos', 'Festividades', 'Datos del distrito'],
      handler: () => ({
        html: `El distrito de La Joya fue creado el <b>2 de enero de 1955</b> mediante Ley N.º 12301, en el primer gobierno de Manuel A. Odría. Su aniversario se celebra anualmente la primera semana de enero con actividades cívicas, culturales y religiosas.
        <ul style="margin-top:8px">
          <li><b>Patrona:</b> Virgen del Carmen (festividad el 16 de julio)</li>
          <li><b>Población estimada:</b> más de 30,000 habitantes</li>
          <li><b>Actividad tradicional:</b> agricultura de regadío en valle desértico</li>
          <li><b>Gastronomía representativa:</b> chicharrón joyano, rocoto relleno, adobo arequipeño, pan chuta con anís</li>
          <li><b>Eventos principales:</b> Feria Dominical, Expo Joya agroexportadora, aniversario distrital</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">La Joya se ha consolidado como un valle agroexportador estratégico para la región Arequipa y un referente de emprendimiento local en el sur del Perú.</p>`
      })
    },
    {
      id: 'seguridad',
      keywords: {'seguridad':3, 'seguro':3, 'peligro':2, 'robo':2, 'policia':3, 'policía':3, 'emergencia':3, 'serenazgo':3, 'denuncia':2, 'proteccion':2, 'protección':2},
      minScore: 2,
      suggestions: ['Contacto municipal', 'Trámites', 'Salud'],
      handler: () => ({
        html: `La seguridad ciudadana en el distrito de La Joya es responsabilidad compartida entre la <b>Policía Nacional del Perú</b> y el <b>Serenazgo Municipal</b>. Los servicios de emergencia son:
        <ul style="margin-top:8px">
          <li><b>Policía Nacional:</b> línea 105 (gratuita, 24 horas)</li>
          <li><b>Bomberos:</b> línea 116 (gratuita, 24 horas)</li>
          <li><b>Serenazgo Municipal:</b> patrullaje diario, comunícate con la central municipal</li>
          <li><b>Central de emergencias:</b> línea 911</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Para denuncias o consultas de seguridad, acércate a la comisaría del distrito o comunícate con la Oficina de Seguridad Ciudadana de la municipalidad.</p>`
      })
    },
    {
      id: 'salud',
      keywords: {'salud':3, 'hospital':3, 'clinica':3, 'clínica':3, 'posta':3, 'centro de salud':3, 'medico':2, 'médico':2, 'enfermedad':2, 'farmacia':3, 'botica':3, 'medicamento':2, 'doctor':2, 'dentista':3, 'dental':3, 'covid':3, 'vacuna':3},
      minScore: 2,
      suggestions: ['Farmacias en el directorio', 'Contacto municipal', 'Trámites'],
      handler: () => ({
        html: `Los servicios de salud disponibles en el distrito de La Joya incluyen:
        <ul style="margin-top:8px">
          <li><b>Centro de Salud La Joya (MINSA):</b> atención primaria, vacunación, control materno-infantil</li>
          <li><b>Clínica Dental Sorriso:</b> odontología integral, ortodoncia y estética dental</li>
          <li><b>Botica La Salud:</b> medicamentos, productos de higiene, atención farmacéutica (L–S 8:00–22:00, D 8:00–14:00)</li>
          <li><b>Hospital de referencia:</b> Hospital Honorio Delgado Espinoza (Arequipa metropolitana, 45 min)</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Para emergencias médicas graves, marca la línea 106 (ambulancias) o traslada al paciente al centro de salud más cercano. Para farmacias nocturnas, consulta el directorio donde se indica cuáles ofrecen servicio de guardia.</p>`
      })
    },
    {
      id: 'login_cuenta',
      keywords: {'cuenta':3, 'login':3, 'ingresar':3, 'registrarse':3, 'registro':3, 'identificarme':3, 'usuario':2, 'contrasena':3, 'contraseña':3, 'mi perfil':3, 'sesion':3, 'sesión':3, 'log out':2, 'logout':2},
      minScore: 2,
      suggestions: ['Crear cuenta', 'Comprar', 'Mis pedidos'],
      handler: () => ({
        html: `Para gestionar tu cuenta en el portal de La Joya:
        <ul style="margin-top:8px">
          <li><b>Identifícate:</b> pulsa "¡Bienvenido! Identifícate" en la esquina superior derecha</li>
          <li><b>Cuentas de prueba:</b>
            <ul>
              <li>Vecino: vecino@lajoya.pe / demo123</li>
              <li>Negocio: negocio@lajoya.pe / demo123</li>
              <li>Admin: admin@lajoya.pe / demo123</li>
            </ul>
          </li>
          <li><b>Crear cuenta nueva:</b> pulsa "Crear cuenta" en el modal de autenticación. Elige rol "Vecino" o "Negocio"</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">Una vez identificado, accedes a tus pedidos, favoritos, postulaciones y, si eres negocio, a tu panel de administración con estadísticas, gestión de productos y registros de ventas.</p>`
      })
    },
    {
      id: 'ayuda',
      keywords: {'ayuda':3, 'ayudame':3, 'ayúdame':3, 'no se':2, 'no sé':2, 'no funciona':3, 'error':3, 'problema':3, 'como funciona':3, 'que hago':2, 'tutor':1, 'tutorial':2},
      minScore: 2,
      suggestions: ['Cómo comprar', 'Cómo publicar negocio', 'Contacto'],
      handler: () => ({
        html: `Con gusto te orientamos. El portal de La Joya tiene las siguientes secciones principales:
        <ul style="margin-top:8px">
          <li><b>Catálogo</b> — explora y compra productos del distrito</li>
          <li><b>Directorio</b> — busca negocios por rubro y zona</li>
          <li><b>Mapa</b> — visualiza negocios y lugares en mapa interactivo</li>
          <li><b>Trabajo</b> — postula a vacantes locales</li>
          <li><b>Transporte</b> — calcula tarifas entre puntos</li>
          <li><b>¿Qué pasa?</b> — agenda distrital y atención al ciudadano</li>
          <li><b>Integraciones</b> — estado de APIs conectadas</li>
          <li><b>Transformación digital</b> — modelo de negocio y DER</li>
        </ul>
        <p style="margin-top:8px">¿Sobre cuál sección necesitas más información?</p>`
      })
    }
  ];

  // Detecta la intención con mayor puntaje
  function detectIntent(q) {
    const ql = q.toLowerCase();
    let bestIntent = null;
    let bestScore = 0;
    for (const intent of INTENTS) {
      let score = 0;
      for (const [kw, weight] of Object.entries(intent.keywords)) {
        if (ql.includes(kw)) score += weight;
      }
      if (score > bestScore && score >= (intent.minScore || 1)) {
        bestScore = score;
        bestIntent = intent;
      }
    }
    return bestIntent;
  }

  // Genera respuesta basada en la intención detectada
  function answer(q) {
    const intent = detectIntent(q);
    
    // Registrar en contexto
    if (intent) {
      CHAT_CONTEXT.history.push({ intent: intent.id, q, at: Date.now() });
      if (CHAT_CONTEXT.history.length > 5) CHAT_CONTEXT.history.shift();
      CHAT_CONTEXT.lastIntent = intent.id;
    }

    // Respuesta por defecto si no se detecta intención
    if (!intent) {
      // Buscar si contiene un saludo mínimo
      if (/^(hola|buenas|hey|saludos)\b/i.test(q.trim())) {
        return INTENTS.find(i => i.id === 'saludo').handler(q);
      }
      // Respuesta inteligente de fallback
      return {
        html: `Disculpa, no he comprendido completamente tu consulta. Mi base de conocimiento cubre los siguientes temas del distrito de La Joya:
        <ul style="margin-top:8px">
          <li><b>Comercio:</b> productos, negocios, precios, compras</li>
          <li><b>Empleo:</b> vacantes, postulaciones, convocatorias</li>
          <li><b>Transporte:</b> tarifas, rutas, pasajes</li>
          <li><b>Trámites:</b> documentos, horarios, SERVIR</li>
          <li><b>Turismo:</b> lugares, tours, dunas, oasis</li>
          <li><b>Agricultura:</b> páprika, cebolla, exportación</li>
          <li><b>Salud:</b> hospitales, farmacias, clínicas</li>
          <li><b>Información general:</b> ubicación, clima, historia</li>
        </ul>
        <p style="margin-top:8px;color:var(--ink-3);font-size:.82rem">¿Podrías reformular tu pregunta? También puedes utilizar los accesos rápidos que aparecen abajo para las consultas más frecuentes.</p>`
      };
    }

    // Generar respuesta
    const response = intent.handler(q);
    
    // Agregar sugerencias dinámicas si existen
    if (intent.suggestions) {
      response.suggestions = intent.suggestions;
    }

    return response;
  }

  // Actualizar botones de acceso rápido según la intención
  function updateQuickButtons(suggestions) {
    const quick = $('#chatQuick');
    if (!quick) return;
    
    if (suggestions && suggestions.length > 0) {
      // Mantener siempre los básicos + los sugeridos
      const base = ['Ver catálogo', 'Hablar con humano'];
      const all = [...suggestions, ...base].slice(0, 5);
      quick.innerHTML = all.map(s => `<button type="button" data-q="${esc(s)}">${esc(s)}</button>`).join('');
    } else {
      // Botones por defecto
      const defaults = ['¿Qué productos tienen?', '¿Cómo funciona el delivery?', 'Ver empleos disponibles', 'Tarifa de mototaxi', 'Publicar mi negocio'];
      quick.innerHTML = defaults.map(s => `<button type="button" data-q="${esc(s)}">${esc(s)}</button>`).join('');
    }
  }

  /* ---------- GLOBAL APP HANDLERS ---------- */
  function initGlobalAppHandlers(){
    document.addEventListener('click',(e)=>{
      const b = e.target.closest('[data-action]');
      if(!b) return;
      const act = b.dataset.action;
      // Ignorar acciones que son manejadas por otros handlers
      if(['chat-toggle','chat-open','cookie-accept','auth-tab','login-demo','logout','menu-open','menu-close','social','to-top','legal'].includes(act)){
        return;
      }
      if(act==='auth-open'){ openAuth(); }
      else if(act==='profile-open'){ /* handled in commerce */ }
      else if(act==='analytics-open'){ renderAnalytics(); LJ.closeAllModals(); openModal('mdAnalytics'); }
      else if(act==='webhook-log-open'){ renderWebhooks(); LJ.closeAllModals(); openModal('mdWebhook'); }
      else if(act==='goto'){
        const t = document.querySelector(b.dataset.goto);
        if(t) t.scrollIntoView({behavior:'smooth'});
      }
      else if(act==='pick-location'){ openBizMap(b.dataset.lat, b.dataset.lng); }
      else if(act==='close-modal'){
        const m = b.closest('.modal'); if(m) LJ.closeModal(m.id);
      }
    });
    // Image search (camera button)
    $('#hsCam')?.addEventListener('click',()=>{
      toast('Búsqueda por imagen: toma una foto del producto y la subiremos (demo).','info');
    });
  }

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded',()=>{
    initAuth();
    initContact();
    initPopup();
    initCookie();
    initChat();
    initGlobalAppHandlers();
    updateAcctUI();
  });

  /* ---------- EXPORT ---------- */
  window.LJ = window.LJ || {};
  Object.assign(window.LJ, {
    app: {
      openAuth, login, updateAcctUI,
      renderAnalytics, renderWebhooks, logWebhook,
      openBizMap, openBizMapPicker: openBizMap,
      toggleChat, openChat
    }
  });
})();
