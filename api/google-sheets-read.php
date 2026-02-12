<?php
/**
 * Google Sheets Read Proxy
 * Reads data from Google Sheets server-side to avoid API key restrictions.
 * (Scheduled-publish check runs on the main site load only, not here, to keep admin reads fast.)
 */

require_once __DIR__ . '/_lib/env.php';
require_once __DIR__ . '/_lib/response.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    json_headers(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Get parameters (sheet = tab name, e.g. Articles, Opportunities, Tenders - must match exactly)
$sheetName = isset($_GET['sheet']) ? trim((string) $_GET['sheet']) : 'Articles';
$range = $_GET['range'] ?? 'A1:Z1000';

// Same spreadsheet as admin dashboard: main site and admin both read from this single source.
// Require env vars – no hardcoded keys or IDs. Check both getenv and $_SERVER (e.g. SetEnv / FastCGI).
$apiKey = trim((string) (getenv('GOOGLE_SHEETS_API_KEY') ?: getenv('VITE_GOOGLE_SHEETS_API_KEY') ?: $_SERVER['GOOGLE_SHEETS_API_KEY'] ?? $_SERVER['VITE_GOOGLE_SHEETS_API_KEY'] ?? ''));
$spreadsheetId = trim((string) (getenv('GOOGLE_SHEETS_ID') ?: getenv('VITE_GOOGLE_SHEETS_ID') ?: $_SERVER['GOOGLE_SHEETS_ID'] ?? $_SERVER['VITE_GOOGLE_SHEETS_ID'] ?? ''));

if ($apiKey === '' || $spreadsheetId === '') {
    json_error('Google Sheets API not configured. Set GOOGLE_SHEETS_API_KEY and GOOGLE_SHEETS_ID (or VITE_* equivalents) in your environment.', 500);
}

// Build the Google Sheets API URL
$url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/{$sheetName}!{$range}?key={$apiKey}";

// Use cURL to fetch data
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    json_error('Failed to connect to Google Sheets API: ' . $curlError, 500);
}

// Parse response
$data = json_decode($response, true);

if ($httpCode !== 200) {
    $errorMsg = isset($data['error']['message']) ? $data['error']['message'] : 'Unknown error';
    json_error("Google Sheets API error ({$httpCode}): {$errorMsg}", $httpCode);
}

if (!isset($data['values']) || empty($data['values'])) {
    json_ok(['values' => []]);
}

// Return the data
json_ok($data);
?>
