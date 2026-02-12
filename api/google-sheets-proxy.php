<?php
/**
 * Google Sheets Proxy
 * This proxy endpoint handles requests to Google Apps Script web apps
 * to avoid CORS issues from the browser
 */

require_once __DIR__ . '/_lib/env.php';
require_once __DIR__ . '/_lib/response.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    json_headers(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

// Require web app URL from environment – no hardcoded URL. Check both getenv and $_SERVER (e.g. SetEnv / FastCGI).
$webAppUrl = trim((string) (getenv('GOOGLE_APPS_SCRIPT_URL') ?: getenv('VITE_GOOGLE_APPS_SCRIPT_URL') ?: $_SERVER['GOOGLE_APPS_SCRIPT_URL'] ?? $_SERVER['VITE_GOOGLE_APPS_SCRIPT_URL'] ?? ''));
if ($webAppUrl === '') {
    json_error('Google Apps Script URL not configured. Set GOOGLE_APPS_SCRIPT_URL or VITE_GOOGLE_APPS_SCRIPT_URL in your environment.', 500);
}

// Get the request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    json_error('Invalid JSON data', 400);
}

// Ensure "values" is sent for append so Apps Script gets correct column count (fixes "data has 1 but range has 14")
$articlesColumns = ['title', 'slug', 'category', 'subheading', 'summary', 'content', 'image', 'heroImage', 'whyItMatters', 'publishedAt', 'author', 'status', 'scheduledAt', 'createdAt'];
$opportunitiesColumns = ['title', 'org', 'country', 'region', 'category', 'amountMin', 'amountMax', 'currency', 'deadline', 'postedAt', 'link', 'tags', 'featured', 'description', 'author', 'createdAt', 'status', 'scheduledAt', 'heroImage'];
$tendersColumns = ['title', 'agency', 'category', 'country', 'region', 'deadline', 'postedAt', 'link', 'description', 'eligibility', 'value', 'createdAt', 'status', 'scheduledAt', 'heroImage'];

if (isset($data['action']) && $data['action'] === 'append' && isset($data['data']) && is_array($data['data']) && empty($data['values'])) {
    $sheet = isset($data['sheet']) ? $data['sheet'] : '';
    $rowData = $data['data'];
    $columns = $sheet === 'Articles' ? $articlesColumns : ($sheet === 'Opportunities' ? $opportunitiesColumns : ($sheet === 'Tenders' ? $tendersColumns : null));
    if ($columns) {
        $row = [];
        foreach ($columns as $key) {
            $v = isset($rowData[$key]) ? $rowData[$key] : '';
            $row[] = $v === null || $v === '' ? '' : (is_array($v) || is_object($v) ? json_encode($v) : (string) $v);
        }
        $data['values'] = [$row];
    }
}

// Log the request for debugging (remove in production)
error_log('Google Sheets Proxy Request: ' . json_encode($data));

// Forward the request to Google Apps Script
$ch = curl_init($webAppUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Log the response for debugging
error_log('Google Sheets Proxy Response (HTTP ' . $httpCode . '): ' . $response);

if ($curlError) {
    error_log('CURL Error: ' . $curlError);
    json_error('Failed to connect to Google Apps Script: ' . $curlError, 500);
}

// Parse the response to check for errors
$responseData = json_decode($response, true);

// If we got a valid JSON response, check for errors
if ($responseData) {
    if (isset($responseData['error'])) {
        json_error($responseData['error'], 500);
    }
    if (isset($responseData['success']) && $responseData['success'] === false) {
        json_error($responseData['error'] ?? 'Unknown error from Google Apps Script', 500);
    }
}

// Return the response
json_headers($httpCode);
echo $response;
?>
