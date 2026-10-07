/* ============================================================
   LA JOYA · Cliente API
   Reemplaza localStorage por llamadas al backend PHP.
   Si el backend no está disponible, hace fallback a localStorage.

   Uso:
   - Cambiar API_BASE si tu backend está en otra URL
   - Incluir este archivo DESPUÉS de lajoya-core.js
   - El cliente reemplaza automáticamente los métodos de commerce

   Para activar/desactivar: LJ.api.useBackend(true/false)
   ============================================================ */
(function(){
  "use strict";
  if (!window.LJ) { console.error('LJ no está disponible'); return; }

  // ====== CONFIGURACIÓN ======
  // Cambia esta URL según tu instalación de XAMPP/WAMP
  // - XAMPP:    http://localhost/php-backend/api
  // - WAMP:     http://localhost/php-backend/api
  // - Laragon:  http://lajoya.test/api  o  http://localhost/php-backend/api
  const API_BASE = window.LJ_API_BASE || 'http://localhost/php-backend/api';

  let useBackend = localStorage.getItem('lj_use_backend') === '1';
  let authToken = localStorage.getItem('lj_auth_token') || null;

  // ====== HELPERS HTTP ======
  async function req(path, opts = {}) {
    const url = path.startsWith('http') ? path : API_BASE + '/' + path.replace(/^\//, '');
    const headers = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
    if (authToken) headers.Authorization = 'Bearer ' + authToken;
    try {
      const res = await fetch(url, { ...opts, headers });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { ok: false, error: text.slice(0,200) }; }
      if (!res.ok && !data.ok) throw new Error(data.error || data.msg || 'HTTP ' + res.status);
      return data;
    } catch (e) {
      // Si el backend no responde, marcamos como no disponible
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        console.warn('[LJ API] Backend no disponible, fallback a localStorage. URL:', url);
        throw new Error('BACKEND_UNAVAILABLE');
      }
      throw e;
    }
  }

  async function get(path) { return req(path, { method: 'GET' }); }
  async function post(path, body = {}) {
    return req(path, { method: 'POST', body: JSON.stringify(body) });
  }
  async function put(path, body = {}) {
    return req(path, { method: 'PUT', body: JSON.stringify(body) });
  }
  async function del(path) {
    return req(path, { method: 'DELETE' });
  }

  // ====== API PÚBLICA ======
  const api = {
    /* CONFIG */
    useBackend(v) {
      useBackend = !!v;
      localStorage.setItem('lj_use_backend', useBackend ? '1' : '0');
      console.log('[LJ API] Backend ' + (useBackend ? 'ACTIVADO' : 'DESACTIVADO') + ' — base: ' + API_BASE);
      return useBackend;
    },
    isUsingBackend() { return useBackend; },
    getToken() { return authToken; },
    setToken(t) {
      authToken = t;
      if (t) localStorage.setItem('lj_auth_token', t);
      else localStorage.removeItem('lj_auth_token');
    },
    base: API_BASE,

    /* AUTENTICACIÓN */
    async login(email, pass) {
      if (!useBackend) return fallback_login(email, pass);
      try {
        const r = await post('auth?action=login', { email, pass });
        if (r.ok) { this.setToken(r.data.token); LJ.store.set('user', r.data.user); }
        return r;
      } catch (e) { return { ok: false, error: e.message }; }
    },
    async register(data) {
      if (!useBackend) return fallback_register(data);
      try {
        const r = await post('auth?action=register', data);
        if (r.ok) { this.setToken(r.data.token); LJ.store.set('user', r.data.user); }
        return r;
      } catch (e) { return { ok: false, error: e.message }; }
    },
    async logout() {
      if (useBackend && authToken) {
        try { await post('auth?action=logout'); } catch {}
      }
      this.setToken(null);
      LJ.store.del('user');
    },
    async me() {
      if (!useBackend || !authToken) return null;
      try { const r = await get('auth?action=me'); return r.ok ? r.data : null; }
      catch { return null; }
    },

    /* CATÁLOGO */
    async productos(filtros = {}) {
      if (!useBackend) return LJ.DATA.productos;
      try {
        const q = new URLSearchParams(filtros).toString();
        const r = await get('productos' + (q ? '?' + q : ''));
        return r.ok ? r.data : LJ.DATA.productos;
      } catch { return LJ.DATA.productos; }
    },
    async producto(id) {
      if (!useBackend) return LJ.DATA.productos.find(p => p.id == id);
      try { const r = await get('productos?id=' + id); return r.ok ? r.data : null; }
      catch { return null; }
    },

    /* NEGOCIOS */
    async negocios(filtros = {}) {
      if (!useBackend) return LJ.DATA.negocios;
      try {
        const q = new URLSearchParams(filtros).toString();
        const r = await get('negocios' + (q ? '?' + q : ''));
        return r.ok ? r.data : LJ.DATA.negocios;
      } catch { return LJ.DATA.negocios; }
    },
    async negocio(id) {
      if (!useBackend) return LJ.DATA.negocios.find(b => b.id == id);
      try { const r = await get('negocios?id=' + id); return r.ok ? r.data : null; }
      catch { return null; }
    },
    async crearNegocio(data) {
      if (!useBackend) return fallback_crear_negocio(data);
      try { return await post('negocios', data); }
      catch (e) { return { ok: false, error: e.message }; }
    },

    /* EMPLEOS */
    async empleos(filtros = {}) {
      if (!useBackend) return LJ.DATA.empleos;
      try {
        const q = new URLSearchParams(filtros).toString();
        const r = await get('empleos' + (q ? '?' + q : ''));
        return r.ok ? r.data : LJ.DATA.empleos;
      } catch { return LJ.DATA.empleos; }
    },
    async postular(data) {
      if (!useBackend) return fallback_postular(data);
      try { return await post('postulaciones', data); }
      catch (e) { return { ok: false, error: e.message }; }
    },

    /* PEDIDOS */
    async crearPedido(payload) {
      if (!useBackend) return fallback_crear_pedido(payload);
      try { return await post('orders', payload); }
      catch (e) { return { ok: false, error: e.message }; }
    },
    async pedidos() {
      if (!useBackend) return LJ.store.get('orders', []);
      try { const r = await get('orders'); return r.ok ? r.data : []; }
      catch { return LJ.store.get('orders', []); }
    },
    async pedido(id) {
      if (!useBackend) return LJ.store.get('orders', []).find(o => o.id == id);
      try { const r = await get('orders?id=' + id); return r.ok ? r.data : null; }
      catch { return null; }
    },

    /* FAVORITOS */
    async favoritos() {
      if (!useBackend) {
        const favs = LJ.store.get('favs', []);
        return favs.map(id => LJ.DATA.productos.find(p => p.id == id)).filter(Boolean);
      }
      try { const r = await get('favoritos'); return r.ok ? r.data : []; }
      catch { return []; }
    },
    async toggleFav(id) {
      if (!useBackend) return fallback_toggle_fav(id);
      // Para simplificar, agregamos siempre; el server hace INSERT IGNORE
      try {
        // Verificar si ya está
        const favs = await this.favoritos();
        const exists = favs.find(p => p.id == id);
        if (exists) { await del('favoritos?id=' + id); return { ok: true, action: 'removed' }; }
        else { await post('favoritos', { id }); return { ok: true, action: 'added' }; }
      } catch (e) { return { ok: false, error: e.message }; }
    },

    /* CARRITO (sincroniza con backend si hay sesión) */
    async syncCart(items) {
      if (!useBackend || !authToken) return;
      try { await post('cart?action=set', { items }); }
      catch {}
    },

    /* TRANSPORTE */
    async transporte(from, to, tipo) {
      if (!useBackend) return null;
      try {
        const r = await get(`transporte?from=${from}&to=${to}&tipo=${tipo}`);
        return r.ok ? r.data : null;
      } catch { return null; }
    },

    /* CUPONES */
    async validarCupon(code) {
      if (!useBackend) {
        const c = { JOYA10: 0.10, JOYA20: 0.20, BIENVENIDA: 0.15 }[code.toUpperCase()];
        return c ? { ok: true, pct: c } : { ok: false, error: 'Cupón inválido' };
      }
      try { return await post('cupones?action=validate', { code }); }
      catch (e) { return { ok: false, error: e.message }; }
    },

    /* PANEL NEGOCIO */
    async panelStats() {
      if (!useBackend) return null;
      try { const r = await get('panel'); return r.ok ? r.data : null; }
      catch { return null; }
    },
    async panelPedidos() {
      if (!useBackend) return LJ.store.get('orders', []);
      try {
        const r = await get('panel?tab=pedidos');
        return r.ok ? r.data : [];
      } catch { return []; }
    },

    /* STATS GLOBALES */
    async stats() {
      if (!useBackend) return null;
      try { const r = await get('stats'); return r.ok ? r.data : null; }
      catch { return null; }
    },

    /* WEBHOOKS */
    async webhooks() {
      if (!useBackend) return LJ.store.get('webhooks', []);
      try { const r = await get('webhooks'); return r.ok ? r.data : []; }
      catch { return LJ.store.get('webhooks', []); }
    },

    /* CONTACTO */
    async contacto(data) {
      if (!useBackend) return fallback_contacto(data);
      try { return await post('contacto', data); }
      catch (e) { return { ok: false, error: e.message }; }
    },
    async newsletter(email) {
      if (!useBackend) { LJ.toast('Suscrito (demo)','ok'); return { ok: true }; }
      try { return await post('contacto?tipo=newsletter', { email }); }
      catch (e) { return { ok: false, error: e.message }; }
    },

    /* LUGARES, AGENDA, INTEGRACIONES */
    async lugares() {
      if (!useBackend) return LJ.DATA.lugares;
      try { const r = await get('lugares'); return r.ok ? r.data : LJ.DATA.lugares; }
      catch { return LJ.DATA.lugares; }
    },
    async agenda() {
      if (!useBackend) return LJ.DATA.agenda;
      try { const r = await get('agenda'); return r.ok ? r.data : LJ.DATA.agenda; }
      catch { return LJ.DATA.agenda; }
    },
    async integraciones() {
      if (!useBackend) return LJ.DATA.integraciones;
      try { const r = await get('integraciones'); return r.ok ? r.data : LJ.DATA.integraciones; }
      catch { return LJ.DATA.integraciones; }
    },

    /* TEST DE CONEXIÓN */
    async test() {
      try {
        const r = await get('categorias');
        console.log('[LJ API] Test OK — backend respondió:', r);
        return true;
      } catch (e) {
        console.warn('[LJ API] Backend no disponible:', e.message);
        return false;
      }
    }
  };

  // ====== FALLBACKS (modo demo con localStorage) ======
  function fallback_login(email, pass) {
    const users = [
      { id: 1, name: 'Vecino Demo', email: 'vecino@lajoya.pe', pass: 'demo123', role: 'vecino' },
      { id: 2, name: 'Negocio Demo', email: 'negocio@lajoya.pe', pass: 'demo123', role: 'negocio' }
    ];
    const u = users.find(x => x.email === email && x.pass === pass);
    if (!u) return { ok: false, error: 'Credenciales incorrectas' };
    const user = { id: u.id, name: u.name, email: u.email, role: u.role };
    LJ.store.set('user', user);
    return { ok: true, data: { token: 'demo-' + Date.now(), user } };
  }
  function fallback_register(data) {
    const users = LJ.store.get('users', []);
    if (users.some(u => u.email === data.email)) return { ok: false, error: 'Email ya existe' };
    const u = { id: Date.now(), name: data.name, email: data.email, role: data.role || 'vecino' };
    users.push(u); LJ.store.set('users', users);
    LJ.store.set('user', u);
    return { ok: true, data: { token: 'demo-' + Date.now(), user: u } };
  }
  function fallback_crear_negocio(data) {
    const myBiz = LJ.store.get('myBiz', []);
    const b = { ...data, id: 'mb' + (myBiz.length + 1), createdAt: new Date().toISOString() };
    myBiz.push(b); LJ.store.set('myBiz', myBiz);
    return { ok: true, msg: 'Negocio creado (demo)', data: { id: b.id } };
  }
  function fallback_postular(data) {
    const apps = LJ.store.get('apps', []);
    apps.push({ ...data, at: new Date().toISOString(), status: 'enviada' });
    LJ.store.set('apps', apps);
    return { ok: true, msg: 'Postulación enviada (demo)' };
  }
  function fallback_crear_pedido(payload) {
    const orders = LJ.store.get('orders', []);
    const order = {
      id: 'LJ-' + Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      items: payload.items,
      ship: payload.ship,
      pay: payload.pay,
      total: payload.total || 0,
      status: 'paid'
    };
    orders.unshift(order); LJ.store.set('orders', orders);
    return { ok: true, msg: 'Pedido creado (demo)', data: order };
  }
  function fallback_toggle_fav(id) {
    const favs = LJ.store.get('favs', []);
    const i = favs.indexOf(id);
    if (i >= 0) { favs.splice(i, 1); LJ.store.set('favs', favs); return { ok: true, action: 'removed' }; }
    favs.push(id); LJ.store.set('favs', favs);
    return { ok: true, action: 'added' };
  }
  function fallback_contacto(data) {
    LJ.toast('Mensaje guardado (demo)','ok');
    return { ok: true, msg: 'Mensaje enviado (demo)' };
  }

  // ====== EXPORTAR ======
  window.LJ.api = api;

  // Auto-test al cargar: si el backend responde, lo activa automáticamente
  if (window.LJ_AUTO_DETECT_BACKEND !== false) {
    document.addEventListener('DOMContentLoaded', async () => {
      const ok = await api.test();
      if (ok && !useBackend) {
        console.log('[LJ API] ✅ Backend detectado. Activando modo backend. Para desactivar: LJ.api.useBackend(false)');
      } else if (!ok && useBackend) {
        console.log('[LJ API] ⚠️ Backend no disponible. Usando localStorage.');
        useBackend = false;
      }
    });
  }

  console.log('[LJ API] Cliente cargado. Base:', API_BASE, '· Backend activo:', useBackend);
})();
