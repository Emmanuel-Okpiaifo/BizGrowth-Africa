<?php
/**
 * Google Sheets Proxy
 * This proxy endpoint handles requests to Google Apps Script web apps
 * to avoid CORS issues from the browser
 */

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

// Get the web app URL from environment or config
$webAppUrl = 'https://script.google.com/macros/s/AKfycbwnH4B-aTZMCFXybHF-wDyQ5v0YtO1OjKOnvn_-kQK0qj2o953le7YQ6XE5_TQMqzZU1A/exec';

// Get the request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    json_error('Invalid JSON data', 400);
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
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

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
