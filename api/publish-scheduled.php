<?php
/**
 * Publish Scheduled Posts
 * Checks for scheduled posts that should be published and updates their status
 * This should be called via cron job or manually
 */

require_once __DIR__ . '/_lib/response.php';

// Set headers
json_headers();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_error('Method not allowed', 405);
    exit;
}

// Get Google Apps Script web app URL from environment or config
// Try to read from .env file first, then fall back to environment variables
$envFile = __DIR__ . '/../.env';
$webAppUrl = '';
$spreadsheetId = '';
$apiKey = '';

// Try reading from .env file
if (file_exists($envFile)) {
    $envContent = file_get_contents($envFile);
    preg_match('/VITE_GOOGLE_APPS_SCRIPT_URL=(.+)/', $envContent, $urlMatch);
    preg_match('/VITE_GOOGLE_SHEETS_ID=(.+)/', $envContent, $idMatch);
    preg_match('/VITE_GOOGLE_SHEETS_API_KEY=(.+)/', $envContent, $keyMatch);
    
    if (!empty($urlMatch[1])) $webAppUrl = trim($urlMatch[1]);
    if (!empty($idMatch[1])) $spreadsheetId = trim($idMatch[1]);
    if (!empty($keyMatch[1])) $apiKey = trim($keyMatch[1]);
}

// Fall back to environment variables (without VITE_ prefix) if .env didn't have them
if (empty($webAppUrl)) $webAppUrl = getenv('GOOGLE_APPS_SCRIPT_URL') ?: getenv('VITE_GOOGLE_APPS_SCRIPT_URL') ?: '';
if (empty($spreadsheetId)) $spreadsheetId = getenv('GOOGLE_SHEETS_ID') ?: getenv('VITE_GOOGLE_SHEETS_ID') ?: '';
if (empty($apiKey)) $apiKey = getenv('GOOGLE_SHEETS_API_KEY') ?: getenv('VITE_GOOGLE_SHEETS_API_KEY') ?: '';

if (empty($webAppUrl) || empty($spreadsheetId) || empty($apiKey)) {
    echo json_error('Missing configuration. Set GOOGLE_APPS_SCRIPT_URL, GOOGLE_SHEETS_ID, and GOOGLE_SHEETS_API_KEY in .env file or as server environment variables.');
    exit;
}

// Sheets to check
$sheets = ['Articles', 'Opportunities', 'Tenders'];

// Get current time in GMT+1 (West Africa Time)
$now = new DateTime('now', new DateTimeZone('Africa/Lagos'));
$nowUTC = new DateTime('now', new DateTimeZone('UTC'));

$publishedCount = 0;
$errors = [];

foreach ($sheets as $sheetName) {
    try {
        // Read all rows from the sheet
        $readUrl = "https://sheets.googleapis.com/v4/spreadsheets/" . urlencode($spreadsheetId) . "/values/" . urlencode($sheetName) . "!A1:Z1000?key=" . urlencode($apiKey);
        
        $ch = curl_init($readUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            $errors[] = "Failed to read {$sheetName}: HTTP {$httpCode}";
            continue;
        }
        
        $data = json_decode($response, true);
        if (!isset($data['values']) || count($data['values']) < 2) {
            continue; // No data rows
        }
        
        $headers = $data['values'][0];
        $rows = array_slice($data['values'], 1);
        
        // Find status and scheduledAt column indices
        $statusIndex = array_search('status', array_map('strtolower', $headers));
        $scheduledAtIndex = array_search('scheduledAt', array_map('strtolower', $headers));
        
        if ($statusIndex === false || $scheduledAtIndex === false) {
            continue; // Columns not found
        }
        
        // Check each row
        foreach ($rows as $rowIndex => $row) {
            $status = isset($row[$statusIndex]) ? trim(strtolower($row[$statusIndex])) : '';
            $scheduledAt = $scheduledAtIndex !== false && isset($row[$scheduledAtIndex]) ? trim($row[$scheduledAtIndex]) : '';
            
            // Skip if not scheduled or already published
            if ($status !== 'scheduled' || empty($scheduledAt)) {
                continue;
            }
            
            // Parse scheduled time (assume it's stored as UTC ISO string)
            try {
                $scheduledTime = new DateTime($scheduledAt, new DateTimeZone('UTC'));
                // Convert to GMT+1 for comparison
                $scheduledTimeGMT1 = clone $scheduledTime;
                $scheduledTimeGMT1->setTimezone(new DateTimeZone('Africa/Lagos'));
                
                // Check if scheduled time has passed (in GMT+1)
                if ($now >= $scheduledTimeGMT1) {
                    // Update status to published
                    $updateData = [
                        'action' => 'update',
                        'sheet' => $sheetName,
                        'row' => $rowIndex + 1, // 1-based index
                        'data' => []
                    ];
                    
                    // Build update data with all current values, updating status and publishedAt
                    // Use the exact header name from Google Sheets (case-sensitive for Apps Script)
                    foreach ($headers as $colIndex => $header) {
                        $value = isset($row[$colIndex]) ? $row[$colIndex] : '';
                        $headerTrimmed = trim($header);
                        $headerLower = strtolower($headerTrimmed);
                        
                        if ($headerLower === 'status') {
                            // Update status to published - use exact header name from sheet
                            $updateData['data'][$headerTrimmed] = 'published';
                        } elseif ($headerLower === 'publishedat') {
                            // Update publishedAt to current datetime (GMT+1) when publishing
                            // Store as ISO format with timezone: YYYY-MM-DDTHH:MM:SS+01:00
                            $currentDateTimeGMT1 = $now->format('Y-m-d\TH:i:s');
                            $updateData['data'][$headerTrimmed] = $currentDateTimeGMT1 . '+01:00';
                        } else {
                            // Keep all other values as-is
                            $updateData['data'][$headerTrimmed] = $value;
                        }
                    }
                    
                    // Send update request to Google Apps Script
                    $ch = curl_init($webAppUrl);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        'Content-Type: application/json'
                    ]);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                    
                    $updateResponse = curl_exec($ch);
                    $updateHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    $curlError = curl_error($ch);
                    curl_close($ch);
                    
                    if ($curlError) {
                        $errors[] = "cURL error updating row " . ($rowIndex + 2) . " in {$sheetName}: {$curlError}";
                        continue;
                    }
                    
                    if ($updateHttpCode === 200) {
                        $result = json_decode($updateResponse, true);
                        if (isset($result['success']) && $result['success']) {
                            $publishedCount++;
                            // Log success for debugging
                            error_log("Successfully published {$sheetName} row " . ($rowIndex + 2) . " - Status updated to 'published'");
                        } else {
                            $errorMsg = isset($result['error']) ? $result['error'] : 'Unknown error';
                            $errors[] = "Failed to publish row " . ($rowIndex + 2) . " in {$sheetName}: {$errorMsg}";
                            error_log("Failed to publish {$sheetName} row " . ($rowIndex + 2) . ": {$errorMsg}");
                        }
                    } else {
                        $errors[] = "HTTP error updating row " . ($rowIndex + 2) . " in {$sheetName}: {$updateHttpCode} - Response: " . substr($updateResponse, 0, 200);
                        error_log("HTTP error updating {$sheetName} row " . ($rowIndex + 2) . ": {$updateHttpCode}");
                    }
                }
            } catch (Exception $e) {
                $errors[] = "Error parsing scheduled time in {$sheetName} row " . ($rowIndex + 2) . ": " . $e->getMessage();
            }
        }
    } catch (Exception $e) {
        $errors[] = "Error processing {$sheetName}: " . $e->getMessage();
    }
}

echo json_ok([
    'published' => $publishedCount,
    'errors' => $errors,
    'timestamp' => $now->format('Y-m-d H:i:s T')
]);
