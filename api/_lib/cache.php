<?php
$__CACHE_DIR = __DIR__ . '/../_cache';
if (!is_dir($__CACHE_DIR)) {
  @mkdir($__CACHE_DIR, 0755, true);
}

function cache_path($key) {
  $safe = preg_replace('/[^a-zA-Z0-9_\-:]/', '_', $key);
  return __DIR__ . '/../_cache/' . $safe . '.json';
}

function cache_get($key) {
  $path = cache_path($key);
  if (!file_exists($path)) return null;
  $raw = @file_get_contents($path);
  if ($raw === false) return null;
  $data = json_decode($raw, true);
  return $data;
}

function cache_set($key, $value) {
  $path = cache_path($key);
  @file_put_contents($path, json_encode($value));
}

