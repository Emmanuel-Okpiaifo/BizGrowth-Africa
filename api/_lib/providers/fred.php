<?php
require_once __DIR__ . '/../cache.php';

function load_keys_fred() {
  $envPath = getenv('BIZGROWTH_KEYS_PATH');
  $fallback = __DIR__ . '/../../../server-config/bizgrowth_keys.php';
  $path = $envPath ?: $fallback;
  if (file_exists($path)) {
    return include $path;
  }
  return [];
}

function fred_series($seriesId, $limit = 120) {
  $keys = load_keys_fred();
  $apiKey = isset($keys['FRED_API_KEY']) ? $keys['FRED_API_KEY'] : '';
  $cacheKey = "fred:series:{$seriesId}";
  $last = cache_get($cacheKey);
  $now = time();
  if ($last && isset($last['ts']) && ($now - $last['ts'] < 3600)) {
    return [$last['data'], false];
  }
  $url = "https://api.stlouisfed.org/fred/series/observations?series_id=" . urlencode($seriesId) . "&observation_start=2000-01-01&api_key=" . urlencode($apiKey) . "&file_type=json";
  $resp = @file_get_contents($url);
  if ($resp === false) {
    if ($last) return [$last['data'], true];
    return [null, true];
  }
  $data = @json_decode($resp, true);
  cache_set($cacheKey, ['ts' => $now, 'data' => $data]);
  return [$data, false];
}

function fred_latest($seriesId) {
  $keys = load_keys_fred();
  $apiKey = isset($keys['FRED_API_KEY']) ? $keys['FRED_API_KEY'] : '';
  if (empty($apiKey)) {
    return [null, 'FRED API key missing'];
  }
  $url = "https://api.stlouisfed.org/fred/series/observations?series_id=" . urlencode($seriesId) . "&sort_order=desc&limit=1&api_key=" . urlencode($apiKey) . "&file_type=json";
  $res = @file_get_contents($url);
  if ($res === false) {
    return [null, 'FRED request failed'];
  }
  $data = @json_decode($res, true);
  $obs = $data['observations'][0] ?? null;
  if (!$obs || !isset($obs['value'])) {
    return [null, 'No observations'];
  }
  $val = is_numeric($obs['value']) ? floatval($obs['value']) : null;
  $t = isset($obs['date']) ? strtotime($obs['date']) * 1000 : (int) round(microtime(true) * 1000);
  if ($val === null) {
    return [null, 'Non-numeric value'];
  }
  return [$val, $t];
}
