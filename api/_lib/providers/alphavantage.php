<?php
require_once __DIR__ . '/../cache.php';

function load_keys() {
  $envPath = getenv('BIZGROWTH_KEYS_PATH');
  $fallback = __DIR__ . '/../../../server-config/bizgrowth_keys.php';
  $path = $envPath ?: $fallback;
  if (file_exists($path)) {
    return include $path;
  }
  return [];
}

function av_fx_quote($from, $to) {
  $keys = load_keys();
  $apiKey = isset($keys['ALPHAVANTAGE_API_KEY']) ? $keys['ALPHAVANTAGE_API_KEY'] : '';
  if (!$apiKey) {
    return [null, 'AlphaVantage key missing'];
  }
  $cacheKey = "avfx:{$from}{$to}";
  $last = cache_get($cacheKey);
  $now = time();
  if ($last && isset($last['ts']) && ($now - $last['ts'] < 60)) {
    return [$last + ['stale' => false], null];
  }
  $url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=" . urlencode($from) . "&to_currency=" . urlencode($to) . "&apikey=" . urlencode($apiKey);
  $resp = @file_get_contents($url);
  if ($resp === false) {
    if ($last) return [$last + ['stale' => true], null];
    return [null, 'Provider error'];
  }
  $data = @json_decode($resp, true);
  $k = 'Realtime Currency Exchange Rate';
  if (!isset($data[$k]['5. Exchange Rate'])) {
    if ($last) return [$last + ['stale' => true], null];
    return [null, 'Unexpected provider response'];
  }
  $rate = floatval($data[$k]['5. Exchange Rate']);
  $quote = [
    'id' => $from . $to,
    'label' => "{$from}/{$to}",
    'price' => $rate,
    'change' => null,
    'changePct' => null,
    'ts' => round(microtime(true) * 1000),
    'source' => 'alphavantage',
    'stale' => false,
  ];
  cache_set($cacheKey, $quote);
  return [$quote, null];
}

