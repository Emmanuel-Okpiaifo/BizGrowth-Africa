<?php
/**
 * Load .env into environment when Apache SetEnv (e.g. .htaccess) is not used or not available.
 * On some hosts SetEnv in .htaccess causes 500; env vars may also be in $_SERVER (e.g. FastCGI).
 */

function env_has_value($value) {
    if ($value === false || $value === null) return false;
    return trim((string) $value) !== '';
}

$googleApiKey = getenv('GOOGLE_SHEETS_API_KEY');
if (($googleApiKey === false || $googleApiKey === '') && !empty($_SERVER['GOOGLE_SHEETS_API_KEY'])) {
    $googleApiKey = $_SERVER['GOOGLE_SHEETS_API_KEY'];
}
if (($googleApiKey === false || $googleApiKey === '') && !empty($_ENV['GOOGLE_SHEETS_API_KEY'])) {
    $googleApiKey = $_ENV['GOOGLE_SHEETS_API_KEY'];
}

$openAiApiKey = getenv('OPENAI_API_KEY');
if (($openAiApiKey === false || $openAiApiKey === '') && !empty($_SERVER['OPENAI_API_KEY'])) {
    $openAiApiKey = $_SERVER['OPENAI_API_KEY'];
}
if (($openAiApiKey === false || $openAiApiKey === '') && !empty($_ENV['OPENAI_API_KEY'])) {
    $openAiApiKey = $_ENV['OPENAI_API_KEY'];
}

if (env_has_value($googleApiKey) && env_has_value($openAiApiKey)) {
    return;
}

function load_env_file_vars($path) {
    if (!$path || !is_file($path) || !is_readable($path)) {
        return;
    }
    $contents = @file_get_contents($path);
    if ($contents === false) {
        return;
    }
    $contents = str_replace("\x1A", '', (string) $contents); // handle accidental Ctrl+Z
    $lines = preg_split("/\r\n|\n|\r/", $contents);
    if (!is_array($lines)) {
        return;
    }
    foreach ($lines as $line) {
        $line = str_replace("\0", '', (string) $line);
        $line = preg_replace('/^\xEF\xBB\xBF|\xFF\xFE|\xFE\xFF/', '', $line);
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
        // Strip UTF-8 BOM from first key if present.
        $key = preg_replace('/^\xEF\xBB\xBF/', '', $key);
        if (preg_match('/^["\'](.+)["\']\s*$/', $value, $m)) {
            $value = $m[1];
        }
        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

$envCandidates = [
    dirname(__DIR__, 2) . '/.env', // project root
    dirname(__DIR__) . '/.env',     // api/.env (optional)
];

foreach ($envCandidates as $candidate) {
    load_env_file_vars($candidate);
}
