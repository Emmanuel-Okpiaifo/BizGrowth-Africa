<?php

function snapshot_cache_path() {
  return __DIR__ . '/../cache/live-snapshot.json';
}

function snapshot_sheet_names() {
  return ['Articles', 'Opportunities', 'Tenders', 'Procurements'];
}

function snapshot_read_sheet_values($sheetName) {
  $apiKey = trim((string) (getenv('GOOGLE_SHEETS_API_KEY') ?: getenv('VITE_GOOGLE_SHEETS_API_KEY') ?: $_SERVER['GOOGLE_SHEETS_API_KEY'] ?? $_SERVER['VITE_GOOGLE_SHEETS_API_KEY'] ?? ''));
  $spreadsheetId = trim((string) (getenv('GOOGLE_SHEETS_ID') ?: getenv('VITE_GOOGLE_SHEETS_ID') ?: $_SERVER['GOOGLE_SHEETS_ID'] ?? $_SERVER['VITE_GOOGLE_SHEETS_ID'] ?? ''));
  if ($apiKey === '' || $spreadsheetId === '') return null;

  $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/{$sheetName}!A1:Z1000?key={$apiKey}";
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 30);
  $response = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($httpCode !== 200 || !$response) return null;
  $data = json_decode($response, true);
  if (!is_array($data) || !isset($data['values']) || !is_array($data['values'])) {
    return ['values' => []];
  }
  return ['values' => $data['values']];
}

function snapshot_build_data() {
  $payload = [
    'updatedAt' => gmdate('c'),
    'sheets' => []
  ];
  foreach (snapshot_sheet_names() as $sheetName) {
    $payload['sheets'][$sheetName] = snapshot_read_sheet_values($sheetName) ?: ['values' => []];
  }
  return $payload;
}

function snapshot_write_data($payload) {
  $path = snapshot_cache_path();
  $dir = dirname($path);
  if (!is_dir($dir)) {
    @mkdir($dir, 0775, true);
  }
  $json = json_encode($payload, JSON_UNESCAPED_SLASHES);
  if ($json === false) return false;
  return file_put_contents($path, $json, LOCK_EX) !== false;
}

function snapshot_refresh() {
  $payload = snapshot_build_data();
  $ok = snapshot_write_data($payload);
  return [$ok, $payload];
}

function snapshot_read_data() {
  $path = snapshot_cache_path();
  if (!is_file($path) || !is_readable($path)) return null;
  $raw = file_get_contents($path);
  if ($raw === false || $raw === '') return null;
  $data = json_decode($raw, true);
  return is_array($data) ? $data : null;
}

