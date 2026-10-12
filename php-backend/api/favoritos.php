<?php
/**
 * GET    /api/favoritos.php                 — lista favoritos
 * POST   /api/favoritos.php                 — {id} agregar
 * DELETE /api/favoritos.php?id=1            — quitar
 */
require_once __DIR__ . '/../config.php';

$u = require_auth();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $stmt = db()->prepare('
    SELECT p.id, p.nombre, p.precio, p.img, p.cat, p.negocio_id, p.rating
    FROM favoritos f
    JOIN productos p ON p.id = f.producto_id
    WHERE f.usuario_id = ?
    ORDER BY f.created_at DESC
  ');
  $stmt->execute([$u['id']]);
  json(ok($stmt->fetchAll()));
}

if ($method === 'POST') {
  $b = body();
  $pid = (int)$b['id'];
  if (!$pid) err('Falta id de producto');
  $stmt = db()->prepare('INSERT IGNORE INTO favoritos (usuario_id, producto_id) VALUES (?,?)');
  $stmt->execute([$u['id'], $pid]);
  json(ok(['id' => $pid], 'Agregado a favoritos'), 201);
}

if ($method === 'DELETE') {
  $pid = (int)param('id');
  if (!$pid) err('Falta id de producto');
  $stmt = db()->prepare('DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?');
  $stmt->execute([$u['id'], $pid]);
  json(ok(['id' => $pid], 'Quitado de favoritos'));
}

err('Método no permitido', 405);
