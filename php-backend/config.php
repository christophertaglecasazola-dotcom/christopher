<?php
/**
 * LA JOYA · Configuración general
 * Conexión PDO a MySQL + helpers comunes + CORS
 *
 * Cambia las credenciales abajo según tu instalación (XAMPP/WAMP/Laragon).
 */

// ====== CREDENCIALES DE BASE DE DATOS ======
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'lajoya');
define('DB_USER', 'root');
define('DB_PASS', '');        // XAMPP/WAMP: vacío. Laragon: 'root' o vacío.
define('DB_CHARSET', 'utf8mb4');

// ====== CONFIGURACIÓN GENERAL ======
define('APP_NAME', 'La Joya API');
define('APP_VERSION', '1.0.0');
define('JWT_SECRET', 'cambia-esta-clave-secreta-por-una-tuya-pro pia-2025');
define('CURRENCY_BASE', 'PEN');
define('DELIVERY_COST', 8.00);

// ====== ERRORES (desactivar en producción) ======
error_reporting(E_ALL);
ini_set('display_errors', '1');

// ====== CORS ======
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// ====== CONEXIÓN PDO ======
function db() {
  static $pdo = null;
  if ($pdo === null) {
    $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    try {
      $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
      ]);
    } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error de conexión a la base de datos', 'detalle' => $e->getMessage()]);
      exit;
    }
  }
  return $pdo;
}

// ====== HELPERS ======

/** Respuesta JSON con código HTTP */
function json($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

/** Lee el body JSON de la petición */
function body() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

/** Lee un parámetro GET o POST */
function param($name, $default = null) {
  return $_GET[$name] ?? $_POST[$name] ?? $default;
}

/** Escape HTML */
function e($s) {
  return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8');
}

/** Formatea un precio en la moneda base (PEN) */
function money($n) {
  return 'S/ ' . number_format((float)$n, 2, '.', ',');
}

/** Genera un token aleatorio */
function token($len = 32) {
  return bin2hex(random_bytes($len / 2));
}

/** Hashea contraseña */
function hash_pass($pass) {
  return password_hash($pass, PASSWORD_BCRYPT);
}

/** Verifica contraseña */
function check_pass($pass, $hash) {
  return password_verify($pass, $hash);
}

/** Convierte un array de filas a un formato estándar */
function ok($data = [], $msg = 'OK') {
  return ['ok' => true, 'msg' => $msg, 'data' => $data];
}

function err($msg, $code = 400) {
  json(['ok' => false, 'error' => $msg], $code);
}

/** Autenticación por header Authorization: Bearer <token> */
function auth_user() {
  $headers = getallheaders();
  $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
  if (!preg_match('/Bearer\s+(.+)/i', $auth, $m)) return null;
  $token = trim($m[1]);
  $stmt = db()->prepare('SELECT u.* FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ? AND s.expires > NOW()');
  $stmt->execute([$token]);
  return $stmt->fetch() ?: null;
}

function require_auth() {
  $u = auth_user();
  if (!$u) err('No autenticado', 401);
  return $u;
}

function require_role($roles) {
  $u = require_auth();
  if (!in_array($u['rol'], (array)$roles)) err('Sin permisos', 403);
  return $u;
}

/** Registra un webhook en el log */
function log_webhook($evento, $payload = []) {
  $stmt = db()->prepare('INSERT INTO webhooks (evento, payload) VALUES (?, ?)');
  $stmt->execute([$evento, json_encode($payload, JSON_UNESCAPED_UNICODE)]);
  return db()->lastInsertId();
}

/** Genera un código único para pedidos */
function gen_codigo_pedido() {
  return 'LJ-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
}

/** Calcula distancia haversine (km) */
function distancia_km($lat1, $lng1, $lat2, $lng2) {
  $dx = $lat1 - $lat2;
  $dy = $lng1 - $lng2;
  return sqrt($dx * $dx + $dy * $dy) * 111;
}
