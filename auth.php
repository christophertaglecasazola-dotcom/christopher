<?php
/**
 * POST /api/auth.php?action=login       — login (email, pass)
 * POST /api/auth.php?action=register   — registro (nombre, email, pass, ...)
 * POST /api/auth.php?action=logout     — cierra sesión (auth)
 * GET  /api/auth.php?action=me         — usuario actual (auth)
 */
require_once __DIR__ . '/../config.php';

$action = param('action', 'me');
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'login' && $method === 'POST') {
  $b = body();
  if (empty($b['email']) || empty($b['pass'])) err('Email y contraseña requeridos');
  $stmt = db()->prepare('SELECT * FROM usuarios WHERE email = ?');
  $stmt->execute([$b['email']]);
  $u = $stmt->fetch();
  if (!$u || !check_pass($b['pass'], $u['pass'])) err('Credenciales incorrectas', 401);

  $token = token(48);
  $exp = date('Y-m-d H:i:s', time() + 86400 * 30); // 30 días
  $stmt = db()->prepare('INSERT INTO sesiones (token, usuario_id, expires) VALUES (?,?,?)');
  $stmt->execute([$token, $u['id'], $exp]);

  unset($u['pass']);
  log_webhook('auth.login', ['user_id' => $u['id'], 'email' => $u['email']]);
  json(ok(['token' => $token, 'user' => $u], 'Sesión iniciada'));
}

if ($action === 'register' && $method === 'POST') {
  $b = body();
  foreach (['nombre','email','pass'] as $f) {
    if (empty($b[$f])) err("Falta campo: $f");
  }
  if (strlen($b['pass']) < 6) err('La contraseña debe tener al menos 6 caracteres');

  // Verificar email único
  $stmt = db()->prepare('SELECT id FROM usuarios WHERE email = ?');
  $stmt->execute([$b['email']]);
  if ($stmt->fetch()) err('Ya existe una cuenta con ese email', 409);

  $rol = $b['rol'] ?? 'vecino';
  if (!in_array($rol, ['vecino','negocio'])) $rol = 'vecino';

  $stmt = db()->prepare('INSERT INTO usuarios (nombre, email, pass, telefono, rol) VALUES (?,?,?,?,?)');
  $stmt->execute([
    $b['nombre'], $b['email'], hash_pass($b['pass']),
    $b['telefono'] ?? null, $rol
  ]);
  $uid = db()->lastInsertId();

  $token = token(48);
  $exp = date('Y-m-d H:i:s', time() + 86400 * 30);
  $stmt = db()->prepare('INSERT INTO sesiones (token, usuario_id, expires) VALUES (?,?,?)');
  $stmt->execute([$token, $uid, $exp]);

  $u = ['id' => $uid, 'nombre' => $b['nombre'], 'email' => $b['email'], 'rol' => $rol, 'telefono' => $b['telefono'] ?? null];
  log_webhook('auth.register', ['user_id' => $uid]);
  json(ok(['token' => $token, 'user' => $u], 'Cuenta creada'), 201);
}

if ($action === 'logout') {
  $headers = getallheaders();
  $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
  if (preg_match('/Bearer\s+(.+)/i', $auth, $m)) {
    $stmt = db()->prepare('DELETE FROM sesiones WHERE token = ?');
    $stmt->execute([trim($m[1])]);
  }
  json(ok([], 'Sesión cerrada'));
}

if ($action === 'me') {
  $u = require_auth();
  unset($u['pass']);
  json(ok($u));
}

err('Acción no válida', 400);
