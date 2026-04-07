<?php
require_once __DIR__ . '/_lib/env.php';
require_once __DIR__ . '/_lib/response.php';
require_once __DIR__ . '/_lib/snapshot.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  json_headers(200);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
  json_error('Method not allowed', 405);
}

$expectedToken = trim((string) (getenv('SNAPSHOT_REFRESH_TOKEN') ?: $_SERVER['SNAPSHOT_REFRESH_TOKEN'] ?? ''));
if ($expectedToken !== '') {
  $provided = trim((string) ($_GET['token'] ?? $_SERVER['HTTP_X_SNAPSHOT_TOKEN'] ?? ''));
  if ($provided === '' || !hash_equals($expectedToken, $provided)) {
    json_error('Unauthorized', 401);
  }
}

list($ok, $payload) = snapshot_refresh();
if (!$ok) {
  json_error('Failed to refresh snapshot', 500);
}
json_ok(['success' => true, 'updatedAt' => $payload['updatedAt'] ?? gmdate('c')]);

