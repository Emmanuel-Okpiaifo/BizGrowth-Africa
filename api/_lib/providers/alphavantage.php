<?php
require_once __DIR__ . '/../cache.php';

/**
 * Load API keys: from BIZGROWTH_KEYS_PATH PHP file, or server env, or project .env file.
 * Set ALPHAVANTAGE_API_KEY in .env (project root) or as server env to enable African FX rates.
 */
function load_keys() {
  $envPath = getenv('BIZGROWTH_KEYS_PATH');
  $fallback = __DIR__ . '/../../../server-config/bizgrowth_keys.php';
  $path = $envPath ?: $fallback;
  $keys = [];
  if ($path && file_exists($path)) {
    $keys = (array) include $path;
  }
  if (getenv('ALPHAVANTAGE_API_KEY')) {
    $keys['ALPHAVANTAGE_API_KEY'] = getenv('ALPHAVANTAGE_API_KEY');
  }
  if (empty($keys['ALPHAVANTAGE_API_KEY'])) {
    $candidates = [
      __DIR__ . '/../../../.env',
      __DIR__ . '/../../.env',
    ];
    foreach ($candidates as $dotEnv) {
      if ($dotEnv && file_exists($dotEnv) && is_readable($dotEnv)) {
        $lines = @file($dotEnv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines) {
          foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || (isset($line[0]) && $line[0] === '#')) continue;
            if (strpos($line, '=') !== false) {
              list($name, $val) = explode('=', $line, 2);
              $name = trim($name);
              $val = trim($val, " \t\"'");
              if ($name === 'ALPHAVANTAGE_API_KEY' && $val !== '') {
                $keys['ALPHAVANTAGE_API_KEY'] = $val;
                break 2;
              }
            }
          }
        }
      }
    }
  }
  return $keys;
}

function av_fx_quote($from, $to) {
  $keys = load_keys();
  $apiKey = isset($keys['ALPHAVANTAGE_API_KEY']) ? trim((string) $keys['ALPHAVANTAGE_API_KEY']) : '';
  if ($apiKey === '') {
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

/**
 * Fetch daily FX history for sparkline/chart (compact = last ~30 days).
 * Returns array of ['t' => ms, 'v' => close] sorted by t ascending.
 */
function av_fx_daily($from, $to) {
  $keys = load_keys();
  $apiKey = isset($keys['ALPHAVANTAGE_API_KEY']) ? trim((string) $keys['ALPHAVANTAGE_API_KEY']) : '';
  if ($apiKey === '') return [null, 'AlphaVantage key missing'];
  $cacheKey = "avfxdaily:{$from}{$to}";
  $cached = cache_get($cacheKey);
  $now = time();
  if ($cached && isset($cached['ts']) && ($now - $cached['ts'] < 1200)) {
    return [$cached['points'], null];
  }
  $url = "https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=" . urlencode($from) . "&to_symbol=" . urlencode($to) . "&apikey=" . urlencode($apiKey) . "&outputsize=compact";
  $resp = @file_get_contents($url);
  if ($resp === false) return [null, 'Provider error'];
  $data = @json_decode($resp, true);
  $key = 'Time Series FX (Daily)';
  if (!isset($data[$key]) || !is_array($data[$key])) {
    if ($cached) return [$cached['points'], null];
    return [null, 'No time series'];
  }
  $points = [];
  foreach ($data[$key] as $date => $row) {
    $close = isset($row['4. close']) ? floatval($row['4. close']) : null;
    if ($close !== null) $points[] = ['t' => strtotime($date . ' 00:00:00 UTC') * 1000, 'v' => $close];
  }
  usort($points, function ($a, $b) { return $a['t'] - $b['t']; });
  $points = array_slice($points, -120);
  cache_set($cacheKey, ['ts' => $now, 'points' => $points]);
  return [$points, null];
}

