<?php
/**
 * GET /api/webhooks.php                — lista últimos 50
 * DELETE /api/webhooks.php             — limpia log (solo admin)
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $stmt = db()->query('SELECT * FROM webhooks ORDER BY created_at DESC LIMIT 50');
  json(ok($stmt->fetchAll()));
}

if ($method === 'DELETE') {
  require_role('admin');
  db()->exec('TRUNCATE TABLE webhooks');
  json(ok([], 'Log vaciado'));
}

err('Método no permitido', 405);
