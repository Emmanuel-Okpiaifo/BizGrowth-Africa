<?php
require_once __DIR__ . '/../_lib/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { json_headers(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { json_error('Method not allowed', 405); }

$catalog = [
  ['id' => 'AAPL', 'label' => 'Apple Inc.', 'type' => 'stock'],
  ['id' => 'MSFT', 'label' => 'Microsoft', 'type' => 'stock'],
  ['id' => 'IBM', 'label' => 'IBM', 'type' => 'stock'],
  ['id' => 'BTCUSD', 'label' => 'BTC/USD', 'type' => 'crypto'],
  ['id' => 'ETHUSD', 'label' => 'ETH/USD', 'type' => 'crypto'],
];

$q = isset($_GET['q']) ? strtolower(trim((string) $_GET['q'])) : '';
if ($q === '') {
  json_ok(['results' => $catalog]);
  exit;
}

$results = array_values(array_filter($catalog, function ($item) use ($q) {
  return strpos(strtolower($item['id']), $q) !== false || strpos(strtolower($item['label']), $q) !== false;
}));
json_ok(['results' => $results]);
