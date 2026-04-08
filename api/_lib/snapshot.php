<?php

function snapshot_cache_path() {
  return __DIR__ . '/../cache/live-snapshot.json';
}

function snapshot_sheet_cache_dir() {
  return __DIR__ . '/../cache/sheets';
}

function snapshot_sheet_cache_path($sheetName) {
  $safe = preg_replace('/[^a-zA-Z0-9._-]/', '_', (string) $sheetName);
  return snapshot_sheet_cache_dir() . '/' . $safe . '.json';
}

function snapshot_google_credentials() {
  $apiKey = trim((string) (getenv('GOOGLE_SHEETS_API_KEY') ?: getenv('VITE_GOOGLE_SHEETS_API_KEY') ?: $_SERVER['GOOGLE_SHEETS_API_KEY'] ?? $_SERVER['VITE_GOOGLE_SHEETS_API_KEY'] ?? ''));
  $spreadsheetId = trim((string) (getenv('GOOGLE_SHEETS_ID') ?: getenv('VITE_GOOGLE_SHEETS_ID') ?: $_SERVER['GOOGLE_SHEETS_ID'] ?? $_SERVER['VITE_GOOGLE_SHEETS_ID'] ?? ''));
  return [$apiKey, $spreadsheetId];
}

function snapshot_sheet_names() {
  list($apiKey, $spreadsheetId) = snapshot_google_credentials();
  if ($apiKey !== '' && $spreadsheetId !== '') {
    $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}?fields=sheets(properties(title))&key={$apiKey}";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpCode === 200 && $response) {
      $data = json_decode($response, true);
      if (is_array($data) && isset($data['sheets']) && is_array($data['sheets'])) {
        $names = [];
        foreach ($data['sheets'] as $sheet) {
          $title = isset($sheet['properties']['title']) ? trim((string) $sheet['properties']['title']) : '';
          if ($title !== '') $names[] = $title;
        }
        if (!empty($names)) return $names;
      }
    }
  }
  // Safe fallback to core tabs if metadata lookup fails.
  return ['Articles', 'Opportunities', 'Tenders', 'Procurements'];
}

function snapshot_read_sheet_values($sheetName) {
  list($apiKey, $spreadsheetId) = snapshot_google_credentials();
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
  $ok = file_put_contents($path, $json, LOCK_EX) !== false;

  // Also write per-sheet cache files for fast reads.
  $sheetDir = snapshot_sheet_cache_dir();
  if (!is_dir($sheetDir)) {
    @mkdir($sheetDir, 0775, true);
  }
  if (isset($payload['sheets']) && is_array($payload['sheets'])) {
    foreach ($payload['sheets'] as $name => $sheetData) {
      $sheetJson = json_encode(is_array($sheetData) ? $sheetData : ['values' => []], JSON_UNESCAPED_SLASHES);
      if ($sheetJson !== false) {
        @file_put_contents(snapshot_sheet_cache_path($name), $sheetJson, LOCK_EX);
      }
    }
  }
  return $ok;
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

function snapshot_read_sheet_data($sheetName) {
  $path = snapshot_sheet_cache_path($sheetName);
  if (is_file($path) && is_readable($path)) {
    $raw = file_get_contents($path);
    if ($raw !== false && $raw !== '') {
      $data = json_decode($raw, true);
      if (is_array($data)) return $data;
    }
  }
  $all = snapshot_read_data();
  if (is_array($all) && isset($all['sheets']) && is_array($all['sheets']) && isset($all['sheets'][$sheetName])) {
    return is_array($all['sheets'][$sheetName]) ? $all['sheets'][$sheetName] : ['values' => []];
  }
  return null;
}

