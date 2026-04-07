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

$path = snapshot_cache_path();
$exists = is_file($path);
$readable = $exists && is_readable($path);
$sizeBytes = $exists ? (int) @filesize($path) : 0;
$updatedAtFile = $exists ? @filemtime($path) : false;
$updatedAtIso = $updatedAtFile ? gmdate('c', $updatedAtFile) : null;

$snapshot = $readable ? snapshot_read_data() : null;
$snapshotUpdatedAt = is_array($snapshot) && isset($snapshot['updatedAt']) ? $snapshot['updatedAt'] : null;
$sheets = is_array($snapshot) && isset($snapshot['sheets']) && is_array($snapshot['sheets']) ? array_keys($snapshot['sheets']) : [];

json_ok([
  'ok' => $exists && $readable,
  'path' => 'api/cache/live-snapshot.json',
  'exists' => $exists,
  'readable' => $readable,
  'sizeBytes' => $sizeBytes,
  'updatedAtFile' => $updatedAtIso,
  'updatedAtSnapshot' => $snapshotUpdatedAt,
  'sheets' => $sheets
]);

