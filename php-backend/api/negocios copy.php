<?php
/**
 * GET /api/negocios.php              — lista
 * GET /api/negocios.php?id=1        — detalle
 * GET /api/negocios.php?cat=comida
 * GET /api/negocios.php?search=queso
 * POST /api/negocios.php            — crea (requiere auth)
 * PUT  /api/negocios.php?id=1       — actualiza (owner o admin)
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $id = param('id');
  $search = param('search');
  $cat = param('cat');

  if ($id) {
    $stmt = db()->prepare('SELECT * FROM negocios WHERE id = ?');
    $stmt->execute([$id]);
    $b = $stmt->fetch();
    if (!$b) err('Negocio no encontrado', 404);

    // Productos asociados
    $stmt2 = db()->prepare('SELECT id, nombre, precio, img, stock FROM productos WHERE negocio_id = ?');
    $stmt2->execute([$id]);
    $b['productos'] = $stmt2->fetchAll();
    json(ok($b));
  }

  $where = [];
  $params = [];
  if ($search) {
    $where[] = '(nombre LIKE ? OR descripcion LIKE ? OR zona LIKE ?)';
    $q = "%$search%";
    $params[] = $q; $params[] = $q; $params[] = $q;
  }
  if ($cat && $cat !== 'todo') {
    $where[] = 'cat = ?';
    $params[] = $cat;
  }
  $where_sql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

  $stmt = db()->prepare("SELECT * FROM negocios $where_sql ORDER BY rating DESC, nombre ASC");
  $stmt->execute($params);
  json(ok($stmt->fetchAll()));
}

if ($method === 'POST') {
  $u = require_auth();
  $b = body();
  $required = ['nombre','cat','telefono','whatsapp','email','direccion','lat','lng','owner_pass'];
  foreach ($required as $f) {
    if (empty($b[$f])) err("Falta campo: $f");
  }
  if (strlen($b['owner_pass']) < 6) err('La contraseña debe tener al menos 6 caracteres');
  if (strlen($b['telefono']) !== 9) err('Teléfono debe tener 9 dígitos');

  $stmt = db()->prepare('INSERT INTO negocios (nombre, cat, descripcion, zona, direccion, telefono, whatsapp, email, horario, lat, lng, cover, owner_id, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, "pendiente")');
  $stmt->execute([
    $b['nombre'], $b['cat'], $b['descripcion'] ?? '',
    $b['zona'] ?? 'Centro', $b['direccion'], $b['telefono'], $b['whatsapp'],
    $b['email'], $b['horario'] ?? 'L–S 8:00–18:00',
    $b['lat'], $b['lng'], $b['cover'] ?? null, $u['id']
  ]);
  $neg_id = db()->lastInsertId();

  log_webhook('biz.submitted', ['biz_id' => $neg_id, 'name' => $b['nombre']]);
  json(ok(['id' => $neg_id], 'Negocio creado. Pendiente de aprobación.'), 201);
}

if ($method === 'PUT') {
  $u = require_auth();
  $id = param('id');
  $b = body();
  $stmt = db()->prepare('SELECT * FROM negocios WHERE id = ?');
  $stmt->execute([$id]);
  $neg = $stmt->fetch();
  if (!$neg) err('Negocio no encontrado', 404);
  if ($neg['owner_id'] !== $u['id'] && $u['rol'] !== 'admin') err('Sin permisos', 403);

  $fields = ['nombre','cat','descripcion','zona','direccion','telefono','whatsapp','email','horario','lat','lng','cover'];
  $sets = [];
  $vals = [];
  foreach ($fields as $f) {
    if (array_key_exists($f, $b)) {
      $sets[] = "$f = ?";
      $vals[] = $b[$f];
    }
  }
  if (!$sets) err('Nada que actualizar');
  $vals[] = $id;
  $stmt = db()->prepare('UPDATE negocios SET ' . implode(',', $sets) . ' WHERE id = ?');
  $stmt->execute($vals);
  json(ok(['id' => $id], 'Negocio actualizado'));
}

err('Método no permitido', 405);
