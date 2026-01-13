<?php
function json_headers($status = 200) {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
}

function json_ok($data) {
  json_headers(200);
  echo json_encode($data, JSON_UNESCAPED_SLASHES);
  exit;
}

function json_error($message, $status = 400, $extra = []) {
  json_headers($status);
  echo json_encode(['error' => $message] + $extra, JSON_UNESCAPED_SLASHES);
  exit;
}

