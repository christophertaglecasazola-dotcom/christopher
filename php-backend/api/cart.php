<?php
/**
 * Carrito: se gestiona en cliente (localStorage) o servidor (sesión).
 * Aquí guardamos en BD el carrito temporal del usuario autenticado.
 *
 * GET  /api/cart.php                  — ver carrito
 * POST /api/cart.php?action=add       — {id, qty}
 * POST /api/cart.php?action=set       — {items: [{id, qty}]}
 * POST /api/cart.php?action=clear
 *
 * El carrito se guarda en sesiones como JSON.
 */
require_once __DIR__ . '/../config.php';

$u = require_auth();
$method = $_SERVER['REQUEST_METHOD'];

function get_cart($uid) {
  $stmt = db()->prepare('SELECT carrito FROM sesiones WHERE usuario_id = ? ORDER BY expires DESC LIMIT 1');
  $stmt->execute([$uid]);
  $row = $stmt->fetch();
  if (!$row || empty($row['carrito'])) return [];
  return json_decode($row['carrito'], true) ?: [];
}

function save_cart($uid, $cart) {
  $stmt = db()->prepare('UPDATE sesiones SET carrito = ? WHERE usuario_id = ? ORDER BY expires DESC LIMIT 1');
  $stmt->execute([json_encode($cart, JSON_UNESCAPED_UNICODE), $uid]);
}

if ($method === 'GET') {
  $cart = get_cart($u['id']);
  // Enriquecer con datos del producto
  $out = [];
  foreach ($cart as $item) {
    $stmt = db()->prepare('SELECT id, nombre, precio, img, stock, cat FROM productos WHERE id = ?');
    $stmt->execute([$item['id']]);
    $p = $stmt->fetch();
    if ($p) {
      $p['qty'] = $item['qty'];
      $p['subtotal'] = $p['precio'] * $item['qty'];
      $out[] = $p;
    }
  }
  $total = array_sum(array_map(fn($i) => $i['subtotal'], $out));
  json(ok(['items' => $out, 'total' => $total, 'count' => count($out)]));
}

if ($method === 'POST') {
  $action = param('action', 'add');
  $b = body();

  if ($action === 'add') {
    $cart = get_cart($u['id']);
    $pid = (int)$b['id'];
    $qty = max(1, (int)($b['qty'] ?? 1));
    $stmt = db()->prepare('SELECT stock FROM productos WHERE id = ?');
    $stmt->execute([$pid]);
    $p = $stmt->fetch();
    if (!$p) err('Producto no existe', 404);
    if ($p['stock'] <= 0) err('Producto agotado', 400);

    $found = false;
    foreach ($cart as &$item) {
      if ($item['id'] == $pid) {
        $item['qty'] = min($item['qty'] + $qty, $p['stock']);
        $found = true;
        break;
      }
    }
    if (!$found) $cart[] = ['id' => $pid, 'qty' => min($qty, $p['stock'])];
    save_cart($u['id'], $cart);
    json(ok(['count' => count($cart)], 'Agregado al carrito'));
  }

  if ($action === 'set') {
    $cart = $b['items'] ?? [];
    save_cart($u['id'], $cart);
    json(ok(['count' => count($cart)], 'Carrito actualizado'));
  }

  if ($action === 'clear') {
    save_cart($u['id'], []);
    json(ok([], 'Carrito vaciado'));
  }
}

err('Método no permitido', 405);
