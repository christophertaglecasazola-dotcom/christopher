<?php
/**
 * GET /api/stats.php     — analítica global del distrito (admin)
 */
require_once __DIR__ . '/../config.php';
require_role('admin');

$stats = [];
foreach (['usuarios','negocios','productos','pedidos','empleos','postulaciones','webhooks','newsletter','lugares'] as $t) {
  $stats[$t] = (int)db()->query("SELECT COUNT(*) FROM $t")->fetchColumn();
}

$stmt = db()->query('SELECT COALESCE(SUM(total),0) AS total FROM pedidos');
$stats['ventas_total'] = (float)$stmt->fetchColumn();
$stmt = db()->query('SELECT COALESCE(AVG(total),0) AS prom FROM pedidos');
$stats['ticket_promedio'] = (float)$stmt->fetchColumn();

// Ventas por categoría
$stmt = db()->query('
  SELECT p.cat, SUM(pi.precio_unit * pi.cantidad) AS total
  FROM pedido_items pi
  JOIN productos p ON p.id = pi.producto_id
  GROUP BY p.cat
  ORDER BY total DESC
');
$stats['ventas_por_categoria'] = $stmt->fetchAll();

// Ventas por mes últimos 6
$stmt = db()->query("
  SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS n, SUM(total) AS total
  FROM pedidos
  WHERE created_at > DATE_SUB(NOW(), INTERVAL 6 MONTH)
  GROUP BY mes
  ORDER BY mes
");
$stats['ventas_por_mes'] = $stmt->fetchAll();

json(ok($stats));
