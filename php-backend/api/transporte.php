<?php
/**
 * GET /api/transporte.php                — puntos + tipos
 * GET /api/transporte.php?from=cruce&to=yarada&tipo=mototaxi — cálculo
 */
require_once __DIR__ . '/../config.php';

$from = param('from');
$to = param('to');
$tipo_id = param('tipo');

if ($from && $to) {
  $stmt = db()->prepare('SELECT * FROM transporte_puntos WHERE id = ?');
  $stmt->execute([$from]);
  $p1 = $stmt->fetch();
  $stmt->execute([$to]);
  $p2 = $stmt->fetch();
  if (!$p1 || !$p2) err('Puntos no encontrados', 404);

  $stmt = db()->prepare('SELECT * FROM transporte_tipos WHERE id = ?');
  $stmt->execute([$tipo_id ?: 'bus']);
  $tipo = $stmt->fetch();
  if (!$tipo) err('Tipo no válido', 404);

  $km = distancia_km($p1['lat'], $p1['lng'], $p2['lat'], $p2['lng']);
  $base = 4.50;
  $precio = ($base + $km * 0.45) * (float)$tipo['factor'];
  $tiempo = round(($km / max(1, $tipo['velocidad'])) * 60);

  json(ok([
    'from' => $p1, 'to' => $p2, 'tipo' => $tipo,
    'km' => round($km, 2),
    'precio' => round($precio, 2),
    'tiempo_min' => $tiempo,
    'moneda' => CURRENCY_BASE
  ]));
}

// Sin parámetros: devolver todos los puntos y tipos
$puntos = db()->query('SELECT * FROM transporte_puntos')->fetchAll();
$tipos = db()->query('SELECT * FROM transporte_tipos')->fetchAll();
json(ok(['puntos' => $puntos, 'tipos' => $tipos, 'base' => 4.50]));
