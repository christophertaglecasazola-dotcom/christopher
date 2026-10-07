<?php
/**
 * GET /api/agenda.php              — lista agenda distrital
 */
require_once __DIR__ . '/../config.php';
$stmt = db()->query('SELECT * FROM agenda ORDER BY id');
json(ok($stmt->fetchAll()));
