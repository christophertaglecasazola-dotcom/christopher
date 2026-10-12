<?php
/**
 * GET /api/seed.php    — Ejecuta el script SQL schema.sql (solo si las tablas están vacías)
 *
 * Uso: abre http://localhost/php-backend/api/seed.php una sola vez después de crear la BD.
 */
require_once __DIR__ . '/../config.php';

// Verificar si ya está poblado
$count = (int)db()->query('SELECT COUNT(*) FROM productos')->fetchColumn();
if ($count > 0) {
  json(ok(['productos_ya_existentes' => $count], 'La BD ya está poblada. No se ejecutó el seed.'));
}

$sql_path = __DIR__ . '/../sql/schema.sql';
if (!file_exists($sql_path)) err('No se encontró sql/schema.sql', 500);

$sql = file_get_contents($sql_path);

// Dividir por ";" evitando los que están dentro de strings o comentarios
// Simplificación: ejecutar statements uno por uno (separados por ";\n")
$statements = array_filter(array_map('trim', explode(";\n", $sql)));

$ok_count = 0;
$err_count = 0;
$errors = [];

foreach ($statements as $i => $st) {
  if (!$st || strpos($st, '--') === 0) continue;
  try {
    db()->exec($st);
    $ok_count++;
  } catch (PDOException $e) {
    $err_count++;
    $errors[] = ['statement' => substr($st, 0, 80), 'error' => $e->getMessage()];
  }
}

json([
  'ok' => $err_count === 0,
  'msg' => "Schema ejecutado: $ok_count statements OK, $err_count errores",
  'errors' => $errors
]);
