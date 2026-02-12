<?php
/**
 * Core logic: find scheduled posts whose time has passed and update them to published in Google Sheets.
 * Used by publish-scheduled.php (manual/button) and by google-sheets-read.php (auto, no cron).
 * Only publishes when scheduledAt <= now (when the time has actually reached).
 */

if (!function_exists('run_publish_scheduled')) {

function run_publish_scheduled() {
    $envFile = __DIR__ . '/../../.env';
    $webAppUrl = '';
    $spreadsheetId = '';
    $apiKey = '';

    if (file_exists($envFile)) {
        $envContent = file_get_contents($envFile);
        preg_match('/VITE_GOOGLE_APPS_SCRIPT_URL=(.+)/', $envContent, $urlMatch);
        preg_match('/VITE_GOOGLE_SHEETS_ID=(.+)/', $envContent, $idMatch);
        preg_match('/VITE_GOOGLE_SHEETS_API_KEY=(.+)/', $envContent, $keyMatch);
        if (!empty($urlMatch[1])) $webAppUrl = trim($urlMatch[1]);
        if (!empty($idMatch[1])) $spreadsheetId = trim($idMatch[1]);
        if (!empty($keyMatch[1])) $apiKey = trim($keyMatch[1]);
    }

    if (empty($webAppUrl)) $webAppUrl = trim((string) (getenv('GOOGLE_APPS_SCRIPT_URL') ?: getenv('VITE_GOOGLE_APPS_SCRIPT_URL') ?: ''));
    if (empty($spreadsheetId)) $spreadsheetId = trim((string) (getenv('GOOGLE_SHEETS_ID') ?: getenv('VITE_GOOGLE_SHEETS_ID') ?: ''));
    if (empty($apiKey)) $apiKey = trim((string) (getenv('GOOGLE_SHEETS_API_KEY') ?: getenv('VITE_GOOGLE_SHEETS_API_KEY') ?: ''));

    if (empty($webAppUrl) || empty($spreadsheetId) || empty($apiKey)) {
        return ['published' => 0, 'errors' => ['Missing Google Sheets / Apps Script config.']];
    }

    $sheets = ['Articles', 'Opportunities', 'Tenders'];
    $now = new DateTime('now', new DateTimeZone('Africa/Lagos'));
    $publishedCount = 0;
    $errors = [];

    foreach ($sheets as $sheetName) {
        try {
            $readUrl = "https://sheets.googleapis.com/v4/spreadsheets/" . urlencode($spreadsheetId) . "/values/" . urlencode($sheetName) . "!A1:Z1000?key=" . urlencode($apiKey);
            $ch = curl_init($readUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                $errors[] = "Failed to read {$sheetName}: HTTP {$httpCode}";
                continue;
            }

            $data = json_decode($response, true);
            if (!isset($data['values']) || count($data['values']) < 2) {
                continue;
            }

            $headers = $data['values'][0];
            $rows = array_slice($data['values'], 1);
            $headersLower = array_map('strtolower', array_map('trim', $headers));
            $statusIndex = array_search('status', $headersLower);
            $scheduledAtIndex = array_search('scheduledat', $headersLower);

            if ($statusIndex === false || $scheduledAtIndex === false) {
                continue;
            }

            foreach ($rows as $rowIndex => $row) {
                $status = isset($row[$statusIndex]) ? trim(strtolower((string) $row[$statusIndex])) : '';
                $scheduledAt = isset($row[$scheduledAtIndex]) ? trim((string) $row[$scheduledAtIndex]) : '';

                if ($status !== 'scheduled' || $scheduledAt === '') {
                    continue;
                }

                try {
                    $scheduledTime = new DateTime($scheduledAt);
                    $scheduledTime->setTimezone(new DateTimeZone('Africa/Lagos'));

                    if ($now < $scheduledTime) {
                        continue;
                    }

                    $updateData = [
                        'action' => 'update',
                        'sheet' => $sheetName,
                        'row' => $rowIndex + 1,
                        'data' => []
                    ];

                    foreach ($headers as $colIndex => $header) {
                        $value = isset($row[$colIndex]) ? $row[$colIndex] : '';
                        $headerTrimmed = trim($header);
                        $headerLower = strtolower($headerTrimmed);

                        if ($headerLower === 'status') {
                            $updateData['data'][$headerTrimmed] = 'published';
                        } elseif ($headerLower === 'publishedat') {
                            $updateData['data'][$headerTrimmed] = $now->format('Y-m-d\TH:i:s') . '+01:00';
                        } else {
                            $updateData['data'][$headerTrimmed] = $value;
                        }
                    }

                    $ch = curl_init($webAppUrl);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
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
                        if (!empty($result['success'])) {
                            $publishedCount++;
                        } else {
                            $errors[] = "Row " . ($rowIndex + 2) . " in {$sheetName}: " . (isset($result['error']) ? $result['error'] : 'Unknown error');
                        }
                    } else {
                        $errors[] = "HTTP {$updateHttpCode} updating row " . ($rowIndex + 2) . " in {$sheetName}";
                    }
                } catch (Exception $e) {
                    $errors[] = "Parse error row " . ($rowIndex + 2) . " in {$sheetName}: " . $e->getMessage();
                }
            }
        } catch (Exception $e) {
            $errors[] = "Error processing {$sheetName}: " . $e->getMessage();
        }
    }

    return [
        'published' => $publishedCount,
        'errors' => $errors,
        'timestamp' => $now->format('Y-m-d H:i:s T')
    ];
}

}
