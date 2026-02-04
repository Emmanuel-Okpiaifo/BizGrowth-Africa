<?php
/**
 * Markets snapshot — Finnhub only. One parallel batch, 60s cache.
 * Requires FINNHUB_API_KEY in .env.
 */
set_time_limit(15);
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/cache.php';
require_once __DIR__ . '/../_lib/providers/finnhub.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { json_headers(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { json_error('Method not allowed', 405); }

// Default symbols: stocks + crypto (all via Finnhub quote API)
$DEFAULT_SYMBOLS = [
  ['key' => 'AAPL', 'symbol' => 'AAPL', 'label' => 'Apple Inc.'],
  ['key' => 'MSFT', 'symbol' => 'MSFT', 'label' => 'Microsoft'],
  ['key' => 'IBM', 'symbol' => 'IBM', 'label' => 'IBM'],
  ['key' => 'BTCUSD', 'symbol' => 'BINANCE:BTCUSDT', 'label' => 'BTC/USD'],
  ['key' => 'ETHUSD', 'symbol' => 'BINANCE:ETHUSDT', 'label' => 'ETH/USD'],
];

$idsParam = isset($_GET['ids']) ? trim((string) $_GET['ids']) : '';
$requestedIds = $idsParam !== '' ? array_values(array_filter(array_map('trim', explode(',', $idsParam)))) : [];

// Map requested ids to Finnhub symbols (support same defaults)
$idToItem = [
  'AAPL' => ['key' => 'AAPL', 'symbol' => 'AAPL', 'label' => 'Apple Inc.'],
  'MSFT' => ['key' => 'MSFT', 'symbol' => 'MSFT', 'label' => 'Microsoft'],
  'IBM'  => ['key' => 'IBM', 'symbol' => 'IBM', 'label' => 'IBM'],
  'BTCUSD' => ['key' => 'BTCUSD', 'symbol' => 'BINANCE:BTCUSDT', 'label' => 'BTC/USD'],
  'ETHUSD' => ['key' => 'ETHUSD', 'symbol' => 'BINANCE:ETHUSDT', 'label' => 'ETH/USD'],
];

$items = [];
if (!empty($requestedIds)) {
  foreach ($requestedIds as $id) {
    $idUp = strtoupper(trim($id));
    if (isset($idToItem[$idUp])) $items[] = $idToItem[$idUp];
  }
}
if (empty($items)) $items = $DEFAULT_SYMBOLS;

$cacheKey = 'snapshot:' . md5(implode(',', array_column($items, 'key')));
$nowMs = (int) round(microtime(true) * 1000);
$CACHE_MS = 55000; // 55s

$cached = cache_get($cacheKey);
if ($cached && isset($cached['ts']) && ($nowMs - $cached['ts']) < $CACHE_MS) {
  json_ok(['quotes' => $cached['quotes'], 'ts' => $cached['ts']]);
  exit;
}

$raw = finnhub_quotes_batch($items);
if (empty($raw)) {
  json_ok(['quotes' => [], 'ts' => $nowMs]);
  exit;
}

$order = array_column($items, 'key');
$quotes = [];
foreach ($order as $key) {
  if (!isset($raw[$key])) continue;
  $q = $raw[$key];
  $histKey = 'history:' . $key;
  $hist = cache_get($histKey);
  if (!is_array($hist)) $hist = [];
  $hist[] = ['t' => $q['ts'], 'v' => $q['price']];
  if (count($hist) > 300) $hist = array_slice($hist, -300);
  cache_set($histKey, $hist);
  $q['points'] = array_slice($hist, -30);
  $quotes[] = $q;
}

$payload = ['quotes' => $quotes, 'ts' => $nowMs];
cache_set($cacheKey, ['quotes' => $quotes, 'ts' => $nowMs]);
json_ok($payload);
