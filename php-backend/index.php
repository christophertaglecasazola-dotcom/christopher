<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La Joya · Backend PHP - Test</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 30px auto; padding: 0 20px; background: #f6f1e5; color: #1f1a12; }
    h1 { color: #C25A2B; font-family: Georgia, serif; }
    h2 { color: #1f1a12; border-bottom: 2px solid #C25A2B; padding-bottom: 6px; margin-top: 30px; }
    .box { background: #fff; border: 1px solid rgba(31,26,18,.12); border-radius: 10px; padding: 16px; margin: 12px 0; }
    .ok { color: #4E7148; font-weight: bold; }
    .err { color: #C76B7C; font-weight: bold; }
    .btn { display: inline-block; background: #1f1a12; color: #f6f1e5; padding: 8px 14px; border-radius: 6px; cursor: pointer; margin-right: 6px; text-decoration: none; font-size: 0.9em; }
    .btn:hover { background: #C25A2B; }
    pre { background: #1f1a12; color: #f6f1e5; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 0.85em; }
    code { background: #efe7d2; padding: 2px 6px; border-radius: 3px; }
    ul { line-height: 1.8; }
    .step { counter-reset: s; }
    .step li { counter-increment: s; margin-bottom: 12px; }
    .step li::before { content: counter(s); display: inline-block; background: #C25A2B; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>🌵 La Joya — Backend PHP + MySQL</h1>
  <p>Página de prueba para verificar que el backend está funcionando correctamente.</p>

  <div class="box">
    <strong>Estado actual:</strong>
    <span id="estado">Verificando...</span>
  </div>

  <h2>📦 Endpoints disponibles</h2>
  <div class="box">
    <p>Haz clic en cada enlace para probar:</p>
    <a class="btn" href="api/categorias.php" target="_blank">GET /categorias</a>
    <a class="btn" href="api/productos.php" target="_blank">GET /productos</a>
    <a class="btn" href="api/negocios.php" target="_blank">GET /negocios</a>
    <a class="btn" href="api/empleos.php" target="_blank">GET /empleos</a>
    <a class="btn" href="api/lugares.php" target="_blank">GET /lugares</a>
    <a class="btn" href="api/transporte.php" target="_blank">GET /transporte</a>
    <a class="btn" href="api/integraciones.php" target="_blank">GET /integraciones</a>
    <a class="btn" href="api/agenda.php" target="_blank">GET /agenda</a>
    <a class="btn" href="api/webhooks.php" target="_blank">GET /webhooks</a>
    <a class="btn" href="api/seed.php" target="_blank">GET /seed (poblar BD)</a>
  </div>

  <h2>🚀 Instalación rápida (XAMPP)</h2>
  <ol class="step">
    <li><strong>Copia la carpeta <code>php-backend</code></strong> a <code>C:\xampp\htdocs\php-backend</code></li>
    <li><strong>Inicia XAMPP Control Panel</strong> → activa <strong>Apache</strong> y <strong>MySQL</strong></li>
    <li><strong>Abre</strong> <a href="http://localhost/phpmyadmin" target="_blank">http://localhost/phpmyadmin</a></li>
    <li><strong>Crea la BD</strong>: pega el contenido de <code>sql/schema.sql</code> en la pestaña SQL</li>
    <li><strong>Puebla los datos</strong>: abre <a href="api/seed.php" target="_blank">http://localhost/php-backend/api/seed.php</a></li>
    <li><strong>Verifica</strong>: regresa aquí y prueba los endpoints de arriba</li>
    <li><strong>Conecta el frontend</strong>: copia <code>js/lajoya-api.js</code> junto a tu index.html y agrégalo al HTML</li>
  </ol>

  <h2>🔧 Configuración</h2>
  <p>Edita <code>config.php</code> si tu MySQL tiene otra contraseña:</p>
  <pre>define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'lajoya');
define('DB_USER', 'root');
define('DB_PASS', '');  // XAMPP: vacío. WAMP: 'root'. Laragon: ''.</pre>

  <h2>🔐 Credenciales de prueba</h2>
  <div class="box">
    <p><strong>Vecino demo:</strong> vecino@lajoya.pe / demo123</p>
    <p><strong>Negocio demo:</strong> negocio@lajoya.pe / demo123</p>
    <p><strong>Admin:</strong> admin@lajoya.pe / demo123</p>
    <p style="margin-top:10px;font-size:0.85em;color:#6E6450">⚠️ Las contraseñas en la BD ya están hasheadas con bcrypt.</p>
  </div>

  <h2>🔌 Conectar el frontend HTML al backend</h2>
  <p>Tienes dos opciones:</p>

  <h3>Opción A: Frontend tal cual (sin backend, localStorage)</h3>
  <p>Tu portal HTML actual sigue funcionando igual — todo se guarda en el navegador. Esta es la opción más simple.</p>

  <h3>Opción B: Frontend + backend PHP</h3>
  <p>Para usar la base de datos real en lugar de localStorage:</p>
  <ol>
    <li>Copia <code>js/lajoya-api.js</code> a la carpeta donde está tu <code>index.html</code></li>
    <li>Edita el HTML y agrega esta línea <strong>después</strong> de <code>lajoya-core.js</code>:
      <pre>&lt;script src="js/lajoya-api.js"&gt;&lt;/script&gt;</pre>
    </li>
    <li>Configura la URL del backend editando <code>lajoya-api.js</code> o agregando antes:
      <pre>&lt;script&gt;window.LJ_API_BASE = 'http://localhost/php-backend/api';&lt;/script&gt;</pre>
    </li>
    <li>El cliente detecta automáticamente si el backend responde. Si no responde, usa localStorage como fallback.</li>
    <li>Para forzar el modo backend en consola: <code>LJ.api.useBackend(true)</code></li>
  </ol>

  <h2>📊 Estructura de archivos</h2>
  <pre>php-backend/
├── config.php              → conexión PDO + helpers + CORS
├── README.md               → esta documentación
├── sql/
│   └── schema.sql          → esquema + datos seed (24 productos, 20 negocios, 12 empleos)
├── api/                    → endpoints REST
│   ├── .htaccess           → enrutado amigable + CORS
│   ├── productos.php
│   ├── negocios.php
│   ├── empleos.php
│   ├── categorias.php
│   ├── transporte.php
│   ├── integraciones.php
│   ├── lugares.php
│   ├── agenda.php
│   ├── auth.php            → login/register/logout/me
│   ├── cart.php            → carrito persistente
│   ├── orders.php          → pedidos + items + descuento stock
│   ├── favoritos.php
│   ├── postulaciones.php
│   ├── webhooks.php        → log de eventos
│   ├── contacto.php        → mensajes + newsletter
│   ├── panel.php           → dashboard del negocio
│   ├── cupones.php
│   ├── stats.php           → analítica global (admin)
│   └── seed.php            → puebla la BD
└── js/
    └── lajoya-api.js       → cliente JS para el frontend</pre>

  <h2>🌐 Endpoints de la API REST</h2>
  <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;font-size:0.9em">
    <tr style="background:#1f1a12;color:#f6f1e5"><th>Método</th><th>Ruta</th><th>Descripción</th><th>Auth</th></tr>
    <tr><td>GET</td><td>/api/productos.php</td><td>Lista de productos con filtros</td><td>—</td></tr>
    <tr><td>GET</td><td>/api/productos.php?id=1</td><td>Detalle de un producto</td><td>—</td></tr>
    <tr><td>GET</td><td>/api/negocios.php</td><td>Lista de negocios</td><td>—</td></tr>
    <tr><td>POST</td><td>/api/negocios.php</td><td>Crear negocio (registro)</td><td>✓</td></tr>
    <tr><td>GET</td><td>/api/empleos.php</td><td>Lista de vacantes</td><td>—</td></tr>
    <tr><td>POST</td><td>/api/empleos.php</td><td>Publicar vacante</td><td>negocio</td></tr>
    <tr><td>GET</td><td>/api/categorias.php</td><td>Categorías</td><td>—</td></tr>
    <tr><td>GET</td><td>/api/transporte.php?from=X&to=Y&tipo=Z</td><td>Calcular tarifa</td><td>—</td></tr>
    <tr><td>GET</td><td>/api/lugares.php</td><td>Lugares turísticos</td><td>—</td></tr>
    <tr><td>GET</td><td>/api/agenda.php</td><td>Agenda distrital</td><td>—</td></tr>
    <tr><td>GET</td><td>/api/integraciones.php</td><td>Estado integraciones</td><td>—</td></tr>
    <tr><td>POST</td><td>/api/auth.php?action=login</td><td>Iniciar sesión</td><td>—</td></tr>
    <tr><td>POST</td><td>/api/auth.php?action=register</td><td>Crear cuenta</td><td>—</td></tr>
    <tr><td>POST</td><td>/api/auth.php?action=logout</td><td>Cerrar sesión</td><td>✓</td></tr>
    <tr><td>GET</td><td>/api/auth.php?action=me</td><td>Usuario actual</td><td>✓</td></tr>
    <tr><td>GET/POST</td><td>/api/cart.php</td><td>Carrito persistente</td><td>✓</td></tr>
    <tr><td>POST</td><td>/api/orders.php</td><td>Crear pedido</td><td>✓</td></tr>
    <tr><td>GET</td><td>/api/orders.php</td><td>Mis pedidos</td><td>✓</td></tr>
    <tr><td>PUT</td><td>/api/orders.php?id=X&action=cancel</td><td>Cancelar pedido</td><td>✓</td></tr>
    <tr><td>GET/POST/DELETE</td><td>/api/favoritos.php</td><td>Favoritos</td><td>✓</td></tr>
    <tr><td>POST</td><td>/api/postulaciones.php</td><td>Postular a empleo</td><td>opcional</td></tr>
    <tr><td>GET</td><td>/api/webhooks.php</td><td>Log de webhooks</td><td>—</td></tr>
    <tr><td>POST</td><td>/api/contacto.php</td><td>Mensaje de contacto</td><td>—</td></tr>
    <tr><td>POST</td><td>/api/contacto.php?tipo=newsletter</td><td>Suscripción newsletter</td><td>—</td></tr>
    <tr><td>POST</td><td>/api/cupones.php?action=validate</td><td>Validar cupón</td><td>—</td></tr>
    <tr><td>GET</td><td>/api/panel.php?tab=X</td><td>Dashboard del negocio</td><td>negocio</td></tr>
    <tr><td>GET</td><td>/api/stats.php</td><td>Analítica global</td><td>admin</td></tr>
    <tr><td>GET</td><td>/api/seed.php</td><td>Poblar BD con datos demo</td><td>—</td></tr>
  </table>

  <h2>💡 Ejemplos de uso</h2>

  <h3>Login</h3>
  <pre>POST /api/auth.php?action=login
Content-Type: application/json

{
  "email": "vecino@lajoya.pe",
  "pass": "demo123"
}</pre>
  <pre>Respuesta:
{
  "ok": true,
  "msg": "Sesión iniciada",
  "data": {
    "token": "a1b2c3...",
    "user": { "id": 1, "nombre": "Vecino Demo", "email": "...", "rol": "vecino" }
  }
}</pre>

  <h3>Crear pedido</h3>
  <pre>POST /api/orders.php
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "items": [{ "id": 1, "qty": 2 }, { "id": 5, "qty": 1 }],
  "ship": {
    "name": "Juan Pérez",
    "phone": "954123456",
    "addr": "Jr. Tacna 123",
    "city": "La Joya",
    "method": "delivery"
  },
  "pay": { "method": "card" },
  "cupon": "JOYA10"
}</pre>

  <h2>🛠️ Solución de problemas</h2>

  <p><strong>"Error de conexión a la base de datos":</strong></p>
  <ul>
    <li>Verifica que MySQL esté corriendo en XAMPP/WAMP</li>
    <li>Revisa <code>config.php</code> — el usuario suele ser <code>root</code> sin contraseña</li>
    <li>Confirma que la BD <code>lajoya</code> existe en phpMyAdmin</li>
  </ul>

  <p><strong>"Cupón inválido":</strong></p>
  <ul>
    <li>Verifica que ejecutaste <code>seed.php</code></li>
    <li>Cupones válidos: JOYA10, JOYA20, BIENVENIDA</li>
  </ul>

  <p><strong>"No autenticado":</strong></p>
  <ul>
    <li>Inicia sesión primero en <code>/api/auth.php?action=login</code></li>
    <li>Envía el token en el header <code>Authorization: Bearer &lt;token&gt;</code></li>
  </ul>

  <p><strong>CORS error desde el frontend:</strong></p>
  <ul>
    <li>El backend ya envía headers CORS permissivos</li>
    <li>Si tu HTML se sirve desde otro puerto (ej: Live Server 5500), asegúrate de que la URL en <code>lajoya-api.js</code> sea <code>http://localhost/php-backend/api</code></li>
  </ul>

  <p style="margin-top:40px;color:#6E6450;font-size:0.85em;border-top:1px solid rgba(31,26,18,.12);padding-top:14px">
    🌵 La Joya · Arequipa, Perú · Backend PHP v1.0
  </p>

  <script>
    fetch('api/categorias.php')
      .then(r => r.json())
      .then(d => {
        document.getElementById('estado').innerHTML = d.ok
          ? '<span class="ok">✓ Backend OK — ' + (d.data?.length || 0) + ' categorías cargadas</span>'
          : '<span class="err">✗ Backend respondió pero con error</span>';
      })
      .catch(e => {
        document.getElementById('estado').innerHTML = '<span class="err">✗ Backend no responde — ' + e.message + '</span>';
      });
  </script>
</body>
</html>
