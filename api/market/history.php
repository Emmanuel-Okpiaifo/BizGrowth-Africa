<?php
/**
 * History for chart/sparkline. Crypto (BTC, ETH) via CoinGecko only.
 */
set_time_limit(15);
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/cache.php';
require_once __DIR__ . '/../_lib/providers/coingecko.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { json_headers(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { json_error('Method not allowed', 405); }

$id = isset($_GET['id']) ? strtoupper(trim((string) $_GET['id'])) : '';
if ($id === '') { json_error('id is required', 400); }

$points = [];
if ($id === 'BTCUSD' || $id === 'ETHUSD') {
  list($points, $err) = coingecko_market_chart($id);
  if (!is_array($points)) $points = [];
}
// Keep last 150 points for smoother chart (30-day data); frontend can sample
$points = array_slice($points, -150);
json_ok(['id' => $id, 'points' => array_values($points), 'ts' => round(microtime(true) * 1000), 'stale' => false]);
