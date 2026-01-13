<?php
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/cache.php';
require_once __DIR__ . '/../_lib/providers/alphavantage.php';
require_once __DIR__ . '/../_lib/providers/coingecko.php';
require_once __DIR__ . '/../_lib/providers/fred.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { json_headers(200); exit; }

$ids = isset($_GET['ids']) ? $_GET['ids'] : '';
if (!$ids) json_error('ids is required', 400);
$list = array_filter(array_map('trim', explode(',', $ids)));
$quotes = [];
$nowMs = round(microtime(true) * 1000);

foreach ($list as $id) {
  $idUp = strtoupper($id);
  if (preg_match('/^(BTCUSD|ETHUSD)$/', $idUp)) {
    list($q, $err) = coingecko_quote_usd($idUp);
    if ($q) {
      $quotes[] = $q;
      // Append to history
      $histKey = "history:" . $q['id'];
      $hist = cache_get($histKey) ?: [];
      $hist[] = ['t' => $q['ts'], 'v' => $q['price']];
      if (count($hist) > 300) $hist = array_slice($hist, -300);
      cache_set($histKey, $hist);
      continue;
    }
  }
  // FX like USDZAR
  if (preg_match('/^[A-Z]{6}$/', $idUp)) {
    $from = substr($idUp, 0, 3);
    $to = substr($idUp, 3, 3);
    list($q, $err) = av_fx_quote($from, $to);
    if ($q) {
      $quotes[] = $q;
      $histKey = "history:" . $q['id'];
      $hist = cache_get($histKey) ?: [];
      $hist[] = ['t' => $q['ts'], 'v' => $q['price']];
      if (count($hist) > 300) $hist = array_slice($hist, -300);
      cache_set($histKey, $hist);
      continue;
    }
  }
  // Macro (FRED) whitelisted symbols
  $fredLabels = [
    'DGS10' => 'US 10Y Treasury (FRED)',
    'CPIAUCSL' => 'US CPI (FRED)',
    'UNRATE' => 'US Unemployment Rate (FRED)',
    'DTWEXBGS' => 'US Dollar Broad Index (FRED)',
  ];
  if (isset($fredLabels[$idUp])) {
    list($val, $tsOrErr) = fred_latest($idUp);
    if ($val !== null) {
      $q = [
        'id' => $idUp,
        'label' => $fredLabels[$idUp],
        'price' => $val,
        'change' => null,
        'changePct' => null,
        'ts' => is_numeric($tsOrErr) ? $tsOrErr : round(microtime(true) * 1000),
        'source' => 'fred',
        'stale' => false,
      ];
      $quotes[] = $q;
      // Append to history
      $histKey = "history:" . $q['id'];
      $hist = cache_get($histKey) ?: [];
      $hist[] = ['t' => $q['ts'], 'v' => $q['price']];
      if (count($hist) > 300) $hist = array_slice($hist, -300);
      cache_set($histKey, $hist);
      continue;
    }
  }
  // Unknown => skip gracefully
}

json_ok(['quotes' => $quotes, 'ts' => $nowMs]);

