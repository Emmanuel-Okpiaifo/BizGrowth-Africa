<?php
require_once __DIR__ . '/../_lib/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { json_headers(200); exit; }

$q = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
$catalog = [
  // FX
  ['id' => 'USDZAR', 'label' => 'USD/ZAR', 'type' => 'fx'],
  ['id' => 'USDNGN', 'label' => 'USD/NGN', 'type' => 'fx'],
  ['id' => 'USDEGP', 'label' => 'USD/EGP', 'type' => 'fx'],
  ['id' => 'USDKES', 'label' => 'USD/KES', 'type' => 'fx'],
  ['id' => 'USDGHS', 'label' => 'USD/GHS', 'type' => 'fx'],
  ['id' => 'USDUGX', 'label' => 'USD/UGX', 'type' => 'fx'],
  // Crypto
  ['id' => 'BTCUSD', 'label' => 'BTC/USD', 'type' => 'crypto'],
  ['id' => 'ETHUSD', 'label' => 'ETH/USD', 'type' => 'crypto'],
  // Macro (FRED)
  ['id' => 'DGS10', 'label' => 'US 10Y Treasury (FRED)', 'type' => 'macro'],
  ['id' => 'CPIAUCSL', 'label' => 'US CPI (FRED)', 'type' => 'macro'],
  ['id' => 'UNRATE', 'label' => 'US Unemployment Rate (FRED)', 'type' => 'macro'],
  ['id' => 'DTWEXBGS', 'label' => 'US Dollar Broad Index (FRED)', 'type' => 'macro'],
];

if ($q === '') {
  json_ok(['results' => $catalog]);
}

$results = array_values(array_filter($catalog, function($item) use ($q) {
  return strpos(strtolower($item['id']), $q) !== false || strpos(strtolower($item['label']), $q) !== false;
}));

json_ok(['results' => $results]);

