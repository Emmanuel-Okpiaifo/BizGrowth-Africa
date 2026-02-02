<?php
require_once __DIR__ . '/_lib/response.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	json_headers(200);
	exit;
}

json_headers(200);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_error('Method not allowed', 405);
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
	json_error('No file uploaded or upload error', 400);
}

$file = $_FILES['image'];
$type = $_POST['type'] ?? 'general'; // 'articles', 'opportunities', 'tenders', 'general'

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
$fileType = mime_content_type($file['tmp_name']);

if (!in_array($fileType, $allowedTypes)) {
	json_error('Invalid file type. Only JPG, PNG, and WebP are allowed.', 400);
}

// Validate file size (5MB max)
$maxSize = 5 * 1024 * 1024; // 5MB in bytes
if ($file['size'] > $maxSize) {
	json_error('File size exceeds 5MB limit', 400);
}

// Determine the correct upload directory
// On server: /home/bizgrow1/public_html/uploads/
// API is at: /home/bizgrow1/public_html/api/
// So uploads should be at: /home/bizgrow1/public_html/uploads/ (one level up from api)
$uploadDir = __DIR__ . '/../uploads/' . $type . '/';

// Create directory if it doesn't exist
if (!is_dir($uploadDir)) {
	if (!mkdir($uploadDir, 0755, true)) {
		json_error('Failed to create upload directory: ' . $uploadDir, 500);
	}
}

// Verify directory is writable
if (!is_writable($uploadDir)) {
	json_error('Upload directory is not writable: ' . $uploadDir, 500);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '_' . time() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
	json_error('Failed to save file. Check directory permissions. Path: ' . $filepath, 500);
}

// Verify file was actually saved
if (!file_exists($filepath)) {
	json_error('File was not saved. Path: ' . $filepath, 500);
}

// Set proper file permissions (readable by web server)
chmod($filepath, 0644);

// Get the absolute URL
// Determine the base URL from the request
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'www.bizgrowthafrica.com';
$baseUrl = $protocol . $host;

// Return absolute URL
$urlPath = $baseUrl . '/uploads/' . $type . '/' . $filename;

// Verify file is readable and get its size
$fileSize = filesize($filepath);
$isReadable = is_readable($filepath);

// Return success with absolute URL
json_ok([
	'success' => true,
	'url' => $urlPath,
	'filename' => $filename,
	'fileSize' => $fileSize,
	'fileReadable' => $isReadable,
	'debug' => [
		'uploadDir' => $uploadDir,
		'filepath' => $filepath,
		'baseUrl' => $baseUrl,
		'fileExists' => file_exists($filepath),
		'filePermissions' => substr(sprintf('%o', fileperms($filepath)), -4)
	]
]);
