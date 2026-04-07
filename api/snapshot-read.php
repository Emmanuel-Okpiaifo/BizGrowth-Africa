<?php
require_once __DIR__ . '/_lib/env.php';
require_once __DIR__ . '/_lib/response.php';
require_once __DIR__ . '/_lib/snapshot.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  json_headers(200);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  json_error('Method not allowed', 405);
}

$sheetName = isset($_GET['sheet']) ? trim((string) $_GET['sheet']) : 'Articles';
$all = snapshot_read_data();
if (!$all || !isset($all['sheets']) || !is_array($all['sheets'])) {
  list($ok, $payload) = snapshot_refresh();
  if (!$ok) {
    json_error('Snapshot unavailable', 500);
  }
  $all = $payload;
}

$sheet = $all['sheets'][$sheetName] ?? ['values' => []];
json_ok($sheet);

