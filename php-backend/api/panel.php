<?php
/**
 * GET /api/panel.php                 — stats del negocio del usuario
 * GET /api/panel.php?tab=pedidos    — pedidos que incluyen productos de mi negocio
 * GET /api/panel.php?tab=productos  — mis productos
 * GET /api/panel.php?tab=ventas     — ventas por método de pago
 */
require_once __DIR__ . '/../config.php';

$u = require_role(['negocio','admin']);
$biz_id = $u['biz_id'] ?? null;
if (!$biz_id && $u['rol'] !== 'admin') err('No tienes un negocio asociado', 400);

$tab = param('tab', 'dash');

if ($tab === 'dash') {
  // Total pedidos que tocan productos de mi negocio
  $stmt = db()->prepare('
    SELECT COUNT(DISTINCT pi.pedido_id) AS pedidos, COALESCE(SUM(pi.precio_unit * pi.cantidad), 0) AS ventas
    FROM pedido_items pi
    JOIN productos p ON p.id = pi.producto_id
    WHERE p.negocio_id = ?
  ');
  $stmt->execute([$biz_id]);
  $s = $stmt->fetch();

  $stmt = db()->prepare('SELECT COUNT(*) AS n FROM productos WHERE negocio_id = ?');
  $stmt->execute([$biz_id]);
  $prod = $stmt->fetch();

  $stmt = db()->prepare('SELECT COUNT(DISTINCT f.usuario_id) AS n FROM favoritos f JOIN productos p ON p.id = f.producto_id WHERE p.negocio_id = ?');
  $stmt->execute([$biz_id]);
  $clients = $stmt->fetch();

  json(ok([
    'pedidos' => (int)$s['pedidos'],
    'ventas_total' => (float)$s['ventas'],
    'productos' => (int)$prod['n'],
    'clientes_unicos' => (int)$clients['n']
  ]));
}

if ($tab === 'pedidos') {
  $stmt = db()->prepare('
    SELECT DISTINCT pe.id, pe.codigo, pe.total, pe.status, pe.created_at,
           pe.nombre_cliente, pe.telefono_cliente, pe.metodo_pago
    FROM pedidos pe
    JOIN pedido_items pi ON pi.pedido_id = pe.id
    JOIN productos p ON p.id = pi.producto_id
    WHERE p.negocio_id = ?
    ORDER BY pe.created_at DESC
    LIMIT 50
  ');
  $stmt->execute([$biz_id]);
  json(ok($stmt->fetchAll()));
}

if ($tab === 'productos') {
  $stmt = db()->prepare('SELECT id, nombre, precio, stock, vendidos, img FROM productos WHERE negocio_id = ?');
  $stmt->execute([$biz_id]);
  json(ok($stmt->fetchAll()));
}

if ($tab === 'ventas') {
  $stmt = db()->prepare('
    SELECT pe.metodo_pago, SUM(pi.precio_unit * pi.cantidad) AS total, COUNT(DISTINCT pe.id) AS n
    FROM pedido_items pi
    JOIN productos p ON p.id = pi.producto_id
    JOIN pedidos pe ON pe.id = pi.pedido_id
    WHERE p.negocio_id = ?
    GROUP BY pe.metodo_pago
  ');
  $stmt->execute([$biz_id]);
  json(ok($stmt->fetchAll()));
}

err('Tab no válido', 400);
