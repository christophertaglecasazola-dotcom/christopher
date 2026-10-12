<?php
/**
 * GET /api/integraciones.php       — lista estado de integraciones
 */
require_once __DIR__ . '/../config.php';
$stmt = db()->query('SELECT * FROM integraciones ORDER BY id');
json(ok($stmt->fetchAll()));
