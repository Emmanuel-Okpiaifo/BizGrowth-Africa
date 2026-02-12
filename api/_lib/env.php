<?php
/**
 * Load .env into environment when Apache SetEnv (e.g. .htaccess) is not used or not available.
 * On some hosts SetEnv in .htaccess causes 500; env vars may also be in $_SERVER (e.g. FastCGI).
 */

$apiKey = getenv('GOOGLE_SHEETS_API_KEY');
if (($apiKey === false || $apiKey === '') && !empty($_SERVER['GOOGLE_SHEETS_API_KEY'])) {
    $apiKey = $_SERVER['GOOGLE_SHEETS_API_KEY'];
}
if ($apiKey !== false && $apiKey !== '') {
    return;
}

$dirs = [__DIR__ . '/..', __DIR__ . '/../..'];
foreach ($dirs as $dir) {
    $path = realpath($dir . '/.env');
    if ($path && is_file($path) && is_readable($path)) {
        $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            continue;
        }
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) {
                continue;
            }
            $eq = strpos($line, '=');
            if ($eq === false) {
                continue;
            }
            $key = trim(substr($line, 0, $eq));
            $value = trim(substr($line, $eq + 1));
            if ($key === '') {
                continue;
            }
            if (preg_match('/^["\'](.+)["\']\s*$/', $value, $m)) {
                $value = $m[1];
            }
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
        break;
    }
}
