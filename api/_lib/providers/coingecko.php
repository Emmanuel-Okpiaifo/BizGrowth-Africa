<?php
require_once __DIR__ . '/../cache.php';

function coingecko_simple_prices($ids = ['bitcoin','ethereum'], $vs = 'usd') {
  $idsParam = implode(',', $ids);
  $cacheKey = "cg:simple:{$idsParam}:{$vs}";
  $last = cache_get($cacheKey);
  $now = time();
  if ($last && isset($last['ts']) && ($now - $last['ts'] < 30)) {
    return [$last['data'], false];
  }
  $url = "https://api.coingecko.com/api/v3/simple/price?ids=" . urlencode($idsParam) . "&vs_currencies=" . urlencode($vs);
  $resp = @file_get_contents($url);
  if ($resp === false) {
    if ($last) return [$last['data'], true];
    return [null, true];
  }
  $data = @json_decode($resp, true);
  cache_set($cacheKey, ['ts' => $now, 'data' => $data]);
  return [$data, false];
}

function coingecko_quote_usd($symbol) {
  $map = [
    'BTCUSD' => 'bitcoin',
    'ETHUSD' => 'ethereum',
  ];
  if (!isset($map[$symbol])) return [null, 'unsupported crypto'];
  list($prices, $stale) = coingecko_simple_prices([$map[$symbol]], 'usd');
  if (!$prices || !isset($prices[$map[$symbol]]['usd'])) return [null, 'no data'];
  $price = floatval($prices[$map[$symbol]]['usd']);
  $quote = [
    'id' => $symbol,
    'label' => $symbol === 'BTCUSD' ? 'BTC/USD' : 'ETH/USD',
    'price' => $price,
    'change' => null,
    'changePct' => null,
    'ts' => round(microtime(true) * 1000),
    'source' => 'coingecko',
    'stale' => $stale,
  ];
  return [$quote, null];
}

/**
 * Fetch coin market chart for sparkline (last 30 days).
 * Returns array of ['t' => ms, 'v' => price] sorted by t ascending.
 */
function coingecko_market_chart($symbol) {
  $map = ['BTCUSD' => 'bitcoin', 'ETHUSD' => 'ethereum'];
  if (!isset($map[$symbol])) return [null, 'unsupported'];
  $id = $map[$symbol];
  $cacheKey = "cgchart:{$id}";
  $cached = cache_get($cacheKey);
  $now = time();
  if ($cached && isset($cached['ts']) && ($now - $cached['ts'] < 1200)) {
    return [$cached['points'], null];
  }
  $url = "https://api.coingecko.com/api/v3/coins/" . urlencode($id) . "/market_chart?vs_currency=usd&days=30";
  $ctx = stream_context_create(['http' => ['timeout' => 8], 'ssl' => ['verify_peer' => true]]);
  $resp = @file_get_contents($url, false, $ctx);
  if ($resp === false) {
    if ($cached) return [$cached['points'], null];
    return [null, 'Provider error'];
  }
  $data = @json_decode($resp, true);
  $prices = $data['prices'] ?? [];
  $points = [];
  foreach ($prices as $p) {
    if (count($p) >= 2) $points[] = ['t' => (int) $p[0], 'v' => (float) $p[1]];
  }
  usort($points, function ($a, $b) { return $a['t'] - $b['t']; });
  $points = array_slice($points, -150);
  cache_set($cacheKey, ['ts' => $now, 'points' => $points]);
  return [$points, null];
}

