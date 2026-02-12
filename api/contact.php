<?php
require_once __DIR__ . '/_lib/response.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  json_headers(200);
  exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method not allowed', 405);
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
  json_error('Invalid JSON data');
}

// Validate required fields
$required = ['name', 'email', 'message'];
foreach ($required as $field) {
  if (empty($data[$field])) {
    json_error("Missing required field: $field");
  }
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
  json_error('Invalid email address');
}

// Sanitize input
$name = htmlspecialchars(trim($data['name']), ENT_QUOTES, 'UTF-8');
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$company = isset($data['company']) ? htmlspecialchars(trim($data['company']), ENT_QUOTES, 'UTF-8') : '';
$subject = isset($data['subject']) ? htmlspecialchars(trim($data['subject']), ENT_QUOTES, 'UTF-8') : 'Contact Form Submission';
$message = htmlspecialchars(trim($data['message']), ENT_QUOTES, 'UTF-8');

// Recipient email (from your site). For reliable delivery in production, consider SMTP or a transactional email service.
$to = 'info@bizgrowthafrica.com';

// Email subject
$email_subject = $subject !== 'Contact Form Submission' ? $subject : "New Contact Form Submission from $name";

// Build email body
$email_body = "New contact form submission from BizGrowth Africa website\n\n";
$email_body .= "Name: $name\n";
$email_body .= "Email: $email\n";
if ($company) {
  $email_body .= "Company: $company\n";
}
$email_body .= "Subject: $subject\n\n";
$email_body .= "Message:\n$message\n\n";
$email_body .= "---\n";
$email_body .= "This email was sent from the contact form on bizgrowthafrica.com\n";
$email_body .= "Reply to: $email";

// Email headers
$headers = [
  "From: BizGrowth Africa Contact Form <noreply@bizgrowthafrica.com>",
  "Reply-To: $name <$email>",
  "X-Mailer: PHP/" . phpversion(),
  "MIME-Version: 1.0",
  "Content-Type: text/plain; charset=UTF-8"
];

// Send email
$mail_sent = mail($to, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
  json_ok([
    'success' => true,
    'message' => 'Thank you for your message! We\'ll get back to you soon.'
  ]);
} else {
  json_error('Failed to send email. Please try again later.', 500);
}
