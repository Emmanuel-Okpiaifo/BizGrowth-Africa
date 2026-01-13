<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/_lib/response.php';

$status = [
  'phpVersion' => PHP_VERSION,
  'keys' => [
    'alphaVantage' => false,
    'fred' => false,
  ],
  'configPath' => null,
  'cache' => [
    'path' => __DIR__ . '/_cache',
    'writable' => null,
  ],
];

// Load config via env or fallback
$configPath = getenv('BIZGROWTH_KEYS_PATH');
if (!$configPath) {
  $configPath = __DIR__ . '/../server-config/bizgrowth_keys.php';
}
$status['configPath'] = $configPath;
if (is_file($configPath)) {
  $cfg = include $configPath;
  $status['keys']['alphaVantage'] = !empty($cfg['ALPHAVANTAGE_API_KEY']);
  $status['keys']['fred'] = !empty($cfg['FRED_API_KEY']);
} else {
  $status['keys']['alphaVantage'] = false;
  $status['keys']['fred'] = false;
}

$status['cache']['writable'] = is_writable($status['cache']['path']);

echo json_encode($status, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

