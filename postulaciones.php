<?php
/**
 * GET  /api/postulaciones.php                 — lista mis postulaciones
 * POST /api/postulaciones.php                 — {empleo_id, nombre, telefono, mensaje}
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $u = require_auth();
  $stmt = db()->prepare('
    SELECT p.*, e.titulo AS empleo_titulo, e.empresa
    FROM postulaciones p
    JOIN empleos e ON e.id = p.empleo_id
    WHERE p.usuario_id = ? OR ? = 0
    ORDER BY p.created_at DESC
  ');
  $stmt->execute([$u['id'], $u['id']]);
  json(ok($stmt->fetchAll()));
}

if ($method === 'POST') {
  $b = body();
  foreach (['empleo_id','nombre','telefono'] as $f) {
    if (empty($b[$f])) err("Falta campo: $f");
  }
  if (strlen($b['telefono']) !== 9) err('Teléfono inválido');

  $u = auth_user(); // opcional
  $uid = $u['id'] ?? null;

  $stmt = db()->prepare('INSERT INTO postulaciones (empleo_id, usuario_id, nombre, telefono, mensaje, status) VALUES (?,?,?,?,?,"enviada")');
  $stmt->execute([(int)$b['empleo_id'], $uid, $b['nombre'], $b['telefono'], $b['mensaje'] ?? '']);
  $pid = db()->lastInsertId();

  log_webhook('job.application', ['postulacion_id' => $pid, 'empleo_id' => $b['empleo_id']]);
  json(ok(['id' => $pid], 'Postulación enviada'), 201);
}

err('Método no permitido', 405);
