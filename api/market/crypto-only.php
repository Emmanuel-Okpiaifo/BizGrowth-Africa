<?php
/**
 * Fallback: BTC and ETH from CoinGecko (no API key). Used when snapshot fails.
 */
set_time_limit(10);
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/cache.php';
require_once __DIR__ . '/../_lib/providers/coingecko.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { json_headers(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { json_error('Method not allowed', 405); }

$quotes = [];
foreach (['BTCUSD', 'ETHUSD'] as $sym) {
  list($q, $err) = coingecko_quote_usd($sym);
  if ($q) {
    $q['points'] = [];
    $quotes[] = $q;
  }
}

json_ok(['quotes' => $quotes, 'ts' => round(microtime(true) * 1000)]);
