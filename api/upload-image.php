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

// Create upload directory based on type
$uploadDir = __DIR__ . '/../public/uploads/' . $type . '/';
if (!is_dir($uploadDir)) {
	mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '_' . time() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
	json_error('Failed to save file', 500);
}

// Get the URL path (relative to site root)
$urlPath = '/uploads/' . $type . '/' . $filename;

// Return success with URL
json_ok([
	'success' => true,
	'url' => $urlPath,
	'filename' => $filename
]);
