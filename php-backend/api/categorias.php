<?php
/**
 * GET /api/categorias.php       — lista todas las categorías
 */
require_once __DIR__ . '/../config.php';
$stmt = db()->query('SELECT * FROM categorias ORDER BY orden');
json(ok($stmt->fetchAll()));
