<?php
require_once __DIR__ . '/../_lib/response.php';
require_once __DIR__ . '/../_lib/cache.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { json_headers(200); exit; }

$id = isset($_GET['id']) ? strtoupper(trim($_GET['id'])) : '';
if (!$id) json_error('id is required', 400);
$range = isset($_GET['range']) ? $_GET['range'] : '1D';

$histKey = "history:" . $id;
$points = cache_get($histKey) ?: [];
$ts = round(microtime(true) * 1000);
// Optionally thin points by range
if ($range === '1W') {
  // keep every 5th point
  $points = array_values(array_filter($points, function($v, $i){ return $i % 5 === 0; }, ARRAY_FILTER_USE_BOTH));
} elseif ($range === '1M') {
  $points = array_values(array_filter($points, function($v, $i){ return $i % 10 === 0; }, ARRAY_FILTER_USE_BOTH));
}
$stale = false;
json_ok(['id' => $id, 'points' => $points, 'ts' => $ts, 'stale' => $stale]);

