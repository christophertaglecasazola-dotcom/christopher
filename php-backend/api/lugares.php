<?php
/**
 * GET /api/lugares.php              — lista lugares turísticos
 */
require_once __DIR__ . '/../config.php';
$stmt = db()->query('SELECT * FROM lugares ORDER BY id');
json(ok($stmt->fetchAll()));
