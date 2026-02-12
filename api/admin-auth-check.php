<?php
/**
 * Admin login verification – checks password against server-side hashes.
 * No plaintext passwords in frontend; credentials never stored in code.
 */

require_once __DIR__ . '/_lib/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    json_headers(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);
$username = isset($data['username']) ? trim((string) $data['username']) : '';
$password = isset($data['password']) ? (string) $data['password'] : '';

if ($username === '' || $password === '') {
    json_ok(['success' => false]);
}

$users = require __DIR__ . '/_lib/admin_users.php';
if (!is_array($users)) {
    json_ok(['success' => false]);
}

$canonicalUsername = null;
$hash = null;
foreach ($users as $u => $h) {
    if (strtolower($u) === strtolower($username)) {
        $canonicalUsername = $u;
        $hash = $h;
        break;
    }
}

if ($canonicalUsername === null || !$hash || !password_verify($password, $hash)) {
    json_ok(['success' => false]);
}

json_ok(['success' => true, 'username' => $canonicalUsername]);
