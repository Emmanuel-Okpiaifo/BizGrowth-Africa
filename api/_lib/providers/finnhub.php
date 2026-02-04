<?php
/**
 * Finnhub API — single provider for markets. Free tier, quote endpoint only.
 * Set FINNHUB_API_KEY in .env (project root).
 */

function finnhub_load_key() {
  $key = getenv('FINNHUB_API_KEY');
  if ($key !== false && trim((string) $key) !== '') return trim($key);
  $paths = [__DIR__ . '/../../../.env', __DIR__ . '/../../.env'];
  foreach ($paths as $path) {
    if (!is_file($path) || !is_readable($path)) continue;
    $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!$lines) continue;
    foreach ($lines as $line) {
      $line = trim($line);
      if ($line === '' || $line[0] === '#') continue;
      if (strpos($line, '=') === false) continue;
      list($name, $val) = explode('=', $line, 2);
      if (trim($name) === 'FINNHUB_API_KEY' && trim($val, " \t\"'") !== '') return trim($val, " \t\"'");
    }
  }
  return '';
}

/**
 * Fetch multiple quotes in parallel. $items = [ ['key'=>'AAPL','symbol'=>'AAPL','label'=>'Apple'], ... ]
 * Returns [ 'AAPL' => quoteArray, ... ] (only successful).
 */
function finnhub_quotes_batch($items) {
  $token = finnhub_load_key();
  if ($token === '') return [];
  if (empty($items)) return [];

  $base = 'https://finnhub.io/api/v1/quote';
  $mh = curl_multi_init();
  $handles = [];
  foreach ($items as $item) {
    $sym = isset($item['symbol']) ? $item['symbol'] : $item['key'];
    $url = $base . '?symbol=' . urlencode($sym) . '&token=' . urlencode($token);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
    curl_multi_add_handle($mh, $ch);
    $handles[] = ['ch' => $ch, 'key' => $item['key'], 'label' => isset($item['label']) ? $item['label'] : $item['key']];
  }

  $running = null;
  do {
    curl_multi_exec($mh, $running);
    if ($running > 0) @curl_multi_select($mh, 0.2);
  } while ($running > 0);

  $out = [];
  foreach ($handles as $h) {
    $body = curl_multi_getcontent($h['ch']);
    curl_multi_remove_handle($mh, $h['ch']);
    curl_close($h['ch']);
    if ($body === false || $body === '') continue;
    $data = @json_decode($body, true);
    if (!is_array($data) || !isset($data['c']) || $data['c'] == 0) continue;
    $out[$h['key']] = [
      'id' => $h['key'],
      'label' => $h['label'],
      'price' => (float) $data['c'],
      'change' => isset($data['d']) ? (float) $data['d'] : null,
      'changePct' => isset($data['dp']) ? (float) $data['dp'] : null,
      'ts' => isset($data['t']) && $data['t'] ? (int) $data['t'] * 1000 : round(microtime(true) * 1000),
      'source' => 'finnhub',
      'stale' => false,
    ];
  }
  curl_multi_close($mh);
  return $out;
}
