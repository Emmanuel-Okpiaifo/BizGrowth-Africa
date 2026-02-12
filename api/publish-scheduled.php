<?php
/**
 * Publish Scheduled Posts
 * Publishes items only when their scheduled date/time has been reached (scheduledAt <= now).
 * Updates status to "published" and publishedAt in Google Sheets. Does not run on visitor visits.
 *
 * Call this at or after the scheduled time so due posts get published:
 * - From admin: use the "Publish Scheduled" button on the dashboard (POST).
 * - For automatic publishing at the scheduled time: use a scheduler (e.g. cron-job.org,
 *   your host's cron, or Google Cloud Scheduler) to GET or POST this URL every 5–15 minutes.
 */

require_once __DIR__ . '/_lib/env.php';
require_once __DIR__ . '/_lib/response.php';
require_once __DIR__ . '/_lib/publish_scheduled_core.php';

json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

$result = run_publish_scheduled();
json_ok($result);
