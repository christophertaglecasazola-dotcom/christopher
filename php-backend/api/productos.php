<?php
/**
 * GET  /api/productos.php          — lista (con filtros)
 * GET  /api/productos.php?id=123  — detalle
 * GET  /api/productos.php?search=q
 * GET  /api/productos.php?cat=comida
 * GET  /api/productos.php?oferta=1
 * GET  /api/productos.php?negocio=5
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') err('Método no permitido', 405);

$id = param('id');
$search = param('search');
$cat = param('cat');
$negocio = param('negocio');
$oferta = param('oferta');
$sort = param('sort', 'rel');
$min = param('min');
$max = param('max');
$rating = param('rating', 0);
$limit = min(100, (int)param('limit', 100));

if ($id) {
  $stmt = db()->prepare('
    SELECT p.*, n.nombre AS negocio_nombre, n.zona AS negocio_zona
    FROM productos p
    JOIN negocios n ON n.id = p.negocio_id
    WHERE p.id = ?
  ');
  $stmt->execute([$id]);
  $p = $stmt->fetch();
  if (!$p) err('Producto no encontrado', 404);
  json(ok($p));
}

$where = [];
$params = [];
if ($search) {
  $where[] = '(p.nombre LIKE ? OR p.descripcion LIKE ? OR n.nombre LIKE ?)';
  $q = "%$search%";
  $params[] = $q; $params[] = $q; $params[] = $q;
}
if ($cat && $cat !== 'todo') {
  $where[] = 'p.cat = ?';
  $params[] = $cat;
}
if ($negocio) {
  $where[] = 'p.negocio_id = ?';
  $params[] = $negocio;
}
if ($oferta) {
  $where[] = 'p.oferta = 1';
}
if ($min !== null && $min !== '') {
  $where[] = 'p.precio >= ?';
  $params[] = $min;
}
if ($max !== null && $max !== '') {
  $where[] = 'p.precio <= ?';
  $params[] = $max;
}
if ($rating > 0) {
  $where[] = 'p.rating >= ?';
  $params[] = $rating;
}

$where_sql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$order_sql = match($sort) {
  'precio-asc'  => 'ORDER BY p.precio ASC',
  'precio-desc' => 'ORDER BY p.precio DESC',
  'populares'   => 'ORDER BY p.vendidos DESC',
  'calificacion'=> 'ORDER BY p.rating DESC',
  default       => 'ORDER BY p.id ASC',
};

$sql = "
  SELECT p.id, p.slug, p.nombre, p.cat, p.negocio_id, p.precio, p.precio_old, p.oferta,
         p.rating, p.vendidos, p.stock, p.img, p.zona, n.nombre AS negocio_nombre
  FROM productos p
  JOIN negocios n ON n.id = p.negocio_id
  $where_sql
  $order_sql
  LIMIT $limit
";
$stmt = db()->prepare($sql);
$stmt->execute($params);
$productos = $stmt->fetchAll();

json(ok($productos));
