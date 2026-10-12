<?php
/**
 * GET  /api/orders.php                 — lista pedidos del usuario
 * GET  /api/orders.php?id=1            — detalle
 * POST /api/orders.php                 — crea pedido
 *        body: { items: [{id, qty}], ship: {...}, pay: {...}, cupon?: "JOYA10" }
 * PUT  /api/orders.php?id=1&action=cancel    — cancelar
 * PUT  /api/orders.php?id=1&action=status    — cambiar estado (admin)
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $id = param('id');
  if ($id) {
    $u = require_auth();
    $stmt = db()->prepare('SELECT * FROM pedidos WHERE id = ?');
    $stmt->execute([$id]);
    $o = $stmt->fetch();
    if (!$o) err('Pedido no encontrado', 404);
    if ($u['id'] !== $o['usuario_id'] && $u['rol'] !== 'admin') err('Sin permisos', 403);

    $stmt = db()->prepare('
      SELECT pi.*, p.nombre, p.img
      FROM pedido_items pi
      JOIN productos p ON p.id = pi.producto_id
      WHERE pi.pedido_id = ?
    ');
    $stmt->execute([$id]);
    $o['items'] = $stmt->fetchAll();
    json(ok($o));
  }

  $u = require_auth();
  $stmt = db()->prepare('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY created_at DESC');
  $stmt->execute([$u['id']]);
  json(ok($stmt->fetchAll()));
}

if ($method === 'POST') {
  $u = require_auth();
  $b = body();
  $items = $b['items'] ?? [];
  $ship = $b['ship'] ?? [];
  $pay = $b['pay'] ?? [];
  $cupon = $b['cupon'] ?? null;

  if (count($items) === 0) err('Carrito vacío');
  if (empty($ship['name']) || empty($ship['phone']) || empty($ship['addr'])) err('Datos de envío incompletos');
  if (strlen($ship['phone']) !== 9) err('Teléfono inválido');

  $subtotal = 0;
  $items_validos = [];
  foreach ($items as $i) {
    $stmt = db()->prepare('SELECT id, precio, stock, nombre FROM productos WHERE id = ?');
    $stmt->execute([$i['id']]);
    $p = $stmt->fetch();
    if (!$p) err("Producto {$i['id']} no existe", 404);
    if ($p['stock'] < $i['qty']) err("Stock insuficiente: {$p['nombre']}", 400);
    $items_validos[] = ['producto_id' => $p['id'], 'cantidad' => $i['qty'], 'precio_unit' => $p['precio']];
    $subtotal += $p['precio'] * $i['qty'];
  }

  // Cupón
  $descuento = 0;
  if ($cupon) {
    $stmt = db()->prepare('SELECT * FROM cupones WHERE code = ? AND activo = 1 AND usos < max_usos');
    $stmt->execute([$cupon]);
    $c = $stmt->fetch();
    if ($c) $descuento = $subtotal * (float)$c['pct'];
  }

  $envio = ($ship['method'] ?? 'delivery') === 'delivery' ? DELIVERY_COST : 0;
  $total = $subtotal - $descuento + $envio;
  $codigo = gen_codigo_pedido();

  // Crear pedido
  $stmt = db()->prepare('INSERT INTO pedidos (codigo, usuario_id, total, subtotal, descuento, envio, metodo_envio, metodo_pago, nombre_cliente, telefono_cliente, direccion_cliente, ciudad, referencia, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, "paid")');
  $stmt->execute([
    $codigo, $u['id'], $total, $subtotal, $descuento, $envio,
    $ship['method'] ?? 'delivery', $pay['method'] ?? 'card',
    $ship['name'], $ship['phone'], $ship['addr'], $ship['city'] ?? 'La Joya', $ship['ref'] ?? ''
  ]);
  $pid = db()->lastInsertId();

  // Items
  $stmt = db()->prepare('INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unit) VALUES (?,?,?,?)');
  foreach ($items_validos as $it) {
    $stmt->execute([$pid, $it['producto_id'], $it['cantidad'], $it['precio_unit']]);
    // Descontar stock
    db()->prepare('UPDATE productos SET stock = stock - ?, vendidos = vendidos + ? WHERE id = ?')
        ->execute([$it['cantidad'], $it['cantidad'], $it['producto_id']]);
  }

  // Incrementar uso del cupón
  if ($cupon) db()->prepare('UPDATE cupones SET usos = usos + 1 WHERE code = ?')->execute([$cupon]);

  // Webhook
  log_webhook('order.created', [
    'pedido_id' => $pid, 'codigo' => $codigo, 'total' => $total,
    'usuario_id' => $u['id'], 'metodo_pago' => $pay['method'] ?? 'card'
  ]);

  json(ok(['id' => $pid, 'codigo' => $codigo, 'total' => $total], 'Pedido confirmado'), 201);
}

if ($method === 'PUT') {
  $u = require_auth();
  $id = param('id');
  $action = param('action', 'cancel');
  $stmt = db()->prepare('SELECT * FROM pedidos WHERE id = ?');
  $stmt->execute([$id]);
  $o = $stmt->fetch();
  if (!$o) err('Pedido no encontrado', 404);

  if ($action === 'cancel') {
    if ($u['id'] !== $o['usuario_id'] && $u['rol'] !== 'admin') err('Sin permisos', 403);
    if (!in_array($o['status'], ['pend','paid'])) err('No se puede cancelar', 400);
    db()->prepare('UPDATE pedidos SET status = "cancel" WHERE id = ?')->execute([$id]);
    log_webhook('order.cancelled', ['pedido_id' => $id]);
    json(ok(['id' => $id], 'Pedido cancelado'));
  }

  if ($action === 'status') {
    require_role('admin');
    $b = body();
    $new = $b['status'] ?? null;
    if (!in_array($new, ['pend','paid','shipped','delivered','cancel'])) err('Estado inválido');
    db()->prepare('UPDATE pedidos SET status = ? WHERE id = ?')->execute([$new, $id]);
    log_webhook('order.status', ['pedido_id' => $id, 'status' => $new]);
    json(ok(['id' => $id], 'Estado actualizado'));
  }
}

err('Método no permitido', 405);
