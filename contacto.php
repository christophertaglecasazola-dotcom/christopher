<?php
/**
 * POST /api/contacto.php               — {nombre, email, mensaje}
 * POST /api/contacto.php?tipo=newsletter&email=...  — suscripción
 */
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$tipo = param('tipo', 'mensaje');

if ($method !== 'POST') err('Método no permitido', 405);

$b = body();

if ($tipo === 'newsletter') {
  $email = $b['email'] ?? '';
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) err('Email inválido');
  try {
    $stmt = db()->prepare('INSERT INTO newsletter (email) VALUES (?)');
    $stmt->execute([$email]);
  } catch (PDOException $e) {
    if ($e->getCode() === '23000') json(ok([], 'Ya estabas suscrito'));
    err('Error al suscribir');
  }
  json(ok([], 'Suscrito correctamente'), 201);
}

// Mensaje de contacto
foreach (['nombre','email','mensaje'] as $f) {
  if (empty($b[$f])) err("Falta campo: $f");
}
if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) err('Email inválido');

$stmt = db()->prepare('INSERT INTO mensajes_contacto (nombre, email, mensaje) VALUES (?,?,?)');
$stmt->execute([$b['nombre'], $b['email'], substr($b['mensaje'], 0, 2000)]);
$mid = db()->lastInsertId();

log_webhook('contact.message', ['msg_id' => $mid, 'email' => $b['email']]);
json(ok(['id' => $mid], 'Mensaje enviado'), 201);
