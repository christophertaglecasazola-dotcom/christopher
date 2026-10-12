<?php
/**
 * GET  /api/empleos.php              — lista (filtros: cat, search)
 * GET  /api/empleos.php?id=1        — detalle
 * POST /api/empleos.php              — crea (solo negocio/admin)
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $id = param('id');
  $search = param('search');
  $cat = param('cat');

  if ($id) {
    $stmt = db()->prepare('SELECT * FROM empleos WHERE id = ?');
    $stmt->execute([$id]);
    $j = $stmt->fetch();
    if (!$j) err('Empleo no encontrado', 404);
    json(ok($j));
  }

  $where = ['estado = "activa"'];
  $params = [];
  if ($search) {
    $where[] = '(titulo LIKE ? OR empresa LIKE ? OR descripcion LIKE ?)';
    $q = "%$search%";
    $params[] = $q; $params[] = $q; $params[] = $q;
  }
  if ($cat && $cat !== 'todas') {
    $where[] = 'cat = ?';
    $params[] = $cat;
  }
  $where_sql = 'WHERE ' . implode(' AND ', $where);
  $stmt = db()->prepare("SELECT * FROM empleos $where_sql ORDER BY created_at DESC");
  $stmt->execute($params);
  json(ok($stmt->fetchAll()));
}

if ($method === 'POST') {
  $u = require_role(['negocio','admin']);
  $b = body();
  foreach (['titulo','cat','empresa','salario'] as $f) {
    if (empty($b[$f])) err("Falta campo: $f");
  }
  $stmt = db()->prepare('INSERT INTO empleos (titulo, cat, empresa, negocio_id, salario, tipo, zona, descripcion, estado) VALUES (?,?,?,?,?,?,?,?, "activa")');
  $stmt->execute([
    $b['titulo'], $b['cat'], $b['empresa'],
    $u['biz_id'] ?? null, $b['salario'],
    $b['tipo'] ?? 'Tiempo completo', $b['zona'] ?? 'Centro',
    $b['descripcion'] ?? ''
  ]);
  $jid = db()->lastInsertId();
  log_webhook('job.created', ['job_id' => $jid]);
  json(ok(['id' => $jid], 'Vacante publicada'), 201);
}

err('Método no permitido', 405);
