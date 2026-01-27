<?php
/**
 * Google Sheets Read Proxy
 * Reads data from Google Sheets server-side to avoid API key restrictions
 */

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

// Get parameters
$sheetName = $_GET['sheet'] ?? 'Articles';
$range = $_GET['range'] ?? 'A1:Z1000';

// Get API key and spreadsheet ID from environment or config
$apiKey = 'AIzaSyBZfPhyU2ktSlkkqr2KQsvyO20_Af5Wg40';
$spreadsheetId = '1UvV9_w8UDXcDC1G8_p6Z0TWj5O7W9_DXPBcCNHMwr7w';

if (!$apiKey || !$spreadsheetId) {
    json_error('Google Sheets API not configured', 500);
}

// Build the Google Sheets API URL
$url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/{$sheetName}!{$range}?key={$apiKey}";

// Use cURL to fetch data
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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
