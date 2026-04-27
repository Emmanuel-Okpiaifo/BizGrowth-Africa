<?php
require_once __DIR__ . '/_lib/env.php';
require_once __DIR__ . '/_lib/response.php';
require_once __DIR__ . '/_lib/snapshot.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  json_headers(200);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method not allowed', 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
  json_error('Invalid JSON body', 400);
}

$question = trim((string) ($body['question'] ?? ''));
if ($question === '' || mb_strlen($question) < 2) {
  json_error('Question is required', 400);
}
$rawHistory = $body['history'] ?? [];
if (!is_array($rawHistory)) {
  $rawHistory = [];
}

function chatbot_env($key, $default = '') {
  $value = getenv($key);
  if ($value !== false && $value !== '') {
    return trim((string) $value);
  }
  if (!empty($_SERVER[$key])) {
    return trim((string) $_SERVER[$key]);
  }
  if (!empty($_ENV[$key])) {
    return trim((string) $_ENV[$key]);
  }
  return $default;
}

function chatbot_env_from_dotenv($key) {
  $candidates = [
    dirname(__DIR__) . '/.env',
    dirname(__DIR__) . '/api/.env'
  ];
  foreach ($candidates as $path) {
    if (!is_file($path) || !is_readable($path)) {
      continue;
    }
    $raw = @file_get_contents($path);
    if ($raw === false) {
      continue;
    }
    $raw = str_replace("\x1A", '', (string) $raw);
    $lines = preg_split("/\r\n|\n|\r/", $raw);
    if (!is_array($lines)) {
      continue;
    }
    foreach ($lines as $line) {
      $line = str_replace("\0", '', (string) $line);
      $line = preg_replace('/^\xEF\xBB\xBF|\xFF\xFE|\xFE\xFF/', '', $line);
      $line = trim((string) $line);
      if ($line === '' || strpos($line, '#') === 0) {
        continue;
      }
      $eq = strpos($line, '=');
      if ($eq === false) {
        continue;
      }
      $k = trim(substr($line, 0, $eq));
      $k = preg_replace('/^\xEF\xBB\xBF/', '', $k);
      if ($k !== $key) {
        continue;
      }
      $v = trim(substr($line, $eq + 1));
      if (preg_match('/^["\'](.+)["\']\s*$/', $v, $m)) {
        $v = $m[1];
      }
      return trim((string) $v);
    }
  }
  return '';
}

function chatbot_setting($key, $default = '') {
  $value = chatbot_env($key, '');
  if ($value !== '') {
    return $value;
  }
  $value = chatbot_env_from_dotenv($key);
  if ($value !== '') {
    return $value;
  }
  return $default;
}

$provider = strtolower(chatbot_setting('CHAT_PROVIDER', 'groq'));
if ($provider !== 'groq' && $provider !== 'openai') {
  $provider = 'groq';
}

if ($provider === 'groq') {
  $apiKey = chatbot_setting('GROQ_API_KEY', '');
  if ($apiKey === '') {
    json_error('GROQ_API_KEY is not configured', 500);
  }
  $model = chatbot_setting('GROQ_CHAT_MODEL', 'llama-3.1-8b-instant');
  $providerUrl = chatbot_setting('GROQ_API_BASE_URL', 'https://api.groq.com/openai/v1');
} else {
  $apiKey = chatbot_setting('OPENAI_API_KEY', '');
  if ($apiKey === '') {
    json_error('OPENAI_API_KEY is not configured', 500);
  }
  $model = chatbot_setting('OPENAI_CHAT_MODEL', 'gpt-4o-mini');
  $providerUrl = chatbot_setting('OPENAI_API_BASE_URL', 'https://api.openai.com/v1');
}

$chatUrl = rtrim($providerUrl, '/') . '/chat/completions';

function chatbot_guardrail_response($message, $reason = 'guardrail', $meta = []) {
  return [
    'answer' => $message,
    'sources' => [],
    'referencedItem' => null,
    'listedItems' => [],
    'guardrail' => true,
    'guardrailReason' => trim((string) $reason),
    'guardrailMeta' => is_array($meta) ? $meta : [],
  ];
}

function chatbot_guardrail_cache_root() {
  return __DIR__ . '/cache/chatbot';
}

function chatbot_guardrail_ensure_dir($dir) {
  if (!is_dir($dir)) {
    @mkdir($dir, 0775, true);
  }
  return is_dir($dir) && is_writable($dir);
}

function chatbot_guardrail_json_read($path, $default = []) {
  if (!is_file($path) || !is_readable($path)) return $default;
  $fp = @fopen($path, 'rb');
  if (!$fp) return $default;
  @flock($fp, LOCK_SH);
  $raw = stream_get_contents($fp);
  @flock($fp, LOCK_UN);
  fclose($fp);
  $data = json_decode((string) $raw, true);
  return is_array($data) ? $data : $default;
}

function chatbot_guardrail_json_write($path, $data) {
  $dir = dirname($path);
  if (!chatbot_guardrail_ensure_dir($dir)) return false;
  $fp = @fopen($path, 'c+');
  if (!$fp) return false;
  if (!@flock($fp, LOCK_EX)) {
    fclose($fp);
    return false;
  }
  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($data, JSON_UNESCAPED_SLASHES));
  fflush($fp);
  @flock($fp, LOCK_UN);
  fclose($fp);
  return true;
}

function chatbot_client_ip() {
  $candidates = [
    $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
    $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
    $_SERVER['REMOTE_ADDR'] ?? '',
  ];
  foreach ($candidates as $candidate) {
    $candidate = trim((string) $candidate);
    if ($candidate === '') continue;
    if (strpos($candidate, ',') !== false) {
      $candidate = trim(explode(',', $candidate)[0]);
    }
    if ($candidate !== '') return $candidate;
  }
  return 'unknown';
}

function chatbot_check_rate_limit($ip, $limitPerMinute) {
  if ($limitPerMinute <= 0) return [true, 0];
  $root = chatbot_guardrail_cache_root() . '/rate';
  if (!chatbot_guardrail_ensure_dir($root)) return [true, 0];
  $path = $root . '/' . md5((string) $ip) . '.json';
  $now = time();
  $windowStart = $now - 60;
  $payload = chatbot_guardrail_json_read($path, ['hits' => []]);
  $hits = array_values(array_filter((array) ($payload['hits'] ?? []), function($ts) use ($windowStart) {
    return is_numeric($ts) && (int) $ts >= $windowStart;
  }));
  $remaining = max(0, $limitPerMinute - count($hits));
  if (count($hits) >= $limitPerMinute) {
    chatbot_guardrail_json_write($path, ['hits' => $hits]);
    return [false, $remaining];
  }
  $hits[] = $now;
  chatbot_guardrail_json_write($path, ['hits' => $hits]);
  $remaining = max(0, $limitPerMinute - count($hits));
  return [true, $remaining];
}

function chatbot_check_daily_limit($dailyLimit) {
  if ($dailyLimit <= 0) return [true, 0];
  $root = chatbot_guardrail_cache_root() . '/daily';
  if (!chatbot_guardrail_ensure_dir($root)) return [true, 0];
  $key = gmdate('Ymd');
  $path = $root . '/count-' . $key . '.json';
  $payload = chatbot_guardrail_json_read($path, ['count' => 0]);
  $count = (int) ($payload['count'] ?? 0);
  if ($count >= $dailyLimit) {
    return [false, max(0, $dailyLimit - $count)];
  }
  $count += 1;
  chatbot_guardrail_json_write($path, ['count' => $count]);
  return [true, max(0, $dailyLimit - $count)];
}

function chatbot_cache_key($provider, $question, $history) {
  $q = strtolower(trim((string) $question));
  $q = preg_replace('/\s+/', ' ', $q);
  $historySlice = array_slice(is_array($history) ? $history : [], -3);
  $small = [];
  foreach ($historySlice as $h) {
    if (!is_array($h)) continue;
    $small[] = [
      'r' => substr((string) ($h['role'] ?? ''), 0, 1),
      't' => mb_substr(trim((string) ($h['text'] ?? '')), 0, 120),
      'ref' => mb_substr(trim((string) (($h['referencedItem']['title'] ?? ''))), 0, 80),
    ];
  }
  return sha1(json_encode(['p' => $provider, 'q' => $q, 'h' => $small], JSON_UNESCAPED_SLASHES));
}

function chatbot_cache_get($key, $ttlSec) {
  if ($ttlSec <= 0) return null;
  $root = chatbot_guardrail_cache_root() . '/answers';
  if (!chatbot_guardrail_ensure_dir($root)) return null;
  $path = $root . '/' . $key . '.json';
  if (!is_file($path)) return null;
  $payload = chatbot_guardrail_json_read($path, []);
  $savedAt = (int) ($payload['_savedAt'] ?? 0);
  if ($savedAt <= 0 || (time() - $savedAt) > $ttlSec) return null;
  if (!isset($payload['answer'])) return null;
  unset($payload['_savedAt']);
  return $payload;
}

function chatbot_cache_put($key, $data) {
  $root = chatbot_guardrail_cache_root() . '/answers';
  if (!chatbot_guardrail_ensure_dir($root)) return false;
  $path = $root . '/' . $key . '.json';
  $payload = is_array($data) ? $data : [];
  $payload['_savedAt'] = time();
  return chatbot_guardrail_json_write($path, $payload);
}

function chatbot_select_model($baseModel, $question) {
  $defaultModel = chatbot_setting('CHAT_MODEL_DEFAULT', '');
  $premiumModel = chatbot_setting('CHAT_MODEL_PREMIUM', '');
  $selected = $defaultModel !== '' ? $defaultModel : $baseModel;
  if ($premiumModel === '') return $selected;
  $q = strtolower(trim((string) $question));
  $isComplex = strlen($q) > 180 || preg_match('/\b(explain|compare|analysis|strategy|step by step|comprehensive|deep dive)\b/', $q);
  return $isComplex ? $premiumModel : $selected;
}

function chatbot_is_provider_quota_error($message) {
  $m = strtolower(trim((string) $message));
  if ($m === '') return false;
  return strpos($m, 'quota') !== false
    || strpos($m, 'billing') !== false
    || strpos($m, 'credit') !== false
    || strpos($m, 'rate limit') !== false
    || strpos($m, 'too many requests') !== false;
}

function chatbot_slugify($value) {
  $value = strtolower(trim((string) $value));
  $value = preg_replace('/[^a-z0-9]+/', '-', $value);
  return trim((string) $value, '-') ?: 'item';
}

function chatbot_strip_html($value) {
  $text = html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
  return trim((string) preg_replace('/\s+/', ' ', $text));
}

function chatbot_tokenize($value) {
  $text = strtolower((string) $value);
  $parts = preg_split('/[^a-z0-9]+/', $text);
  $tokens = [];
  foreach ($parts as $p) {
    $p = trim((string) $p);
    if ($p !== '' && strlen($p) > 2) $tokens[$p] = true;
  }
  return array_keys($tokens);
}

function chatbot_clean_history($rawHistory) {
  $clean = [];
  foreach ($rawHistory as $item) {
    if (!is_array($item)) continue;
    $role = strtolower(trim((string) ($item['role'] ?? '')));
    if ($role !== 'user' && $role !== 'assistant') continue;
    $text = trim((string) ($item['text'] ?? ''));
    if ($text === '') continue;
    $listedItems = [];
    if (!empty($item['listedItems']) && is_array($item['listedItems'])) {
      foreach ($item['listedItems'] as $li) {
        if (!is_array($li)) continue;
        $liTitle = trim((string) ($li['title'] ?? ''));
        $liUrl = trim((string) ($li['url'] ?? ''));
        $liType = trim((string) ($li['type'] ?? ''));
        if ($liTitle === '' || $liUrl === '') continue;
        $listedItems[] = [
          'title' => mb_substr($liTitle, 0, 180),
          'url' => $liUrl,
          'type' => mb_substr($liType, 0, 40),
        ];
      }
      if (count($listedItems) > 8) {
        $listedItems = array_slice($listedItems, 0, 8);
      }
    }
    $referencedItem = null;
    if (!empty($item['referencedItem']) && is_array($item['referencedItem'])) {
      $refTitle = trim((string) ($item['referencedItem']['title'] ?? ''));
      $refUrl = trim((string) ($item['referencedItem']['url'] ?? ''));
      $refType = trim((string) ($item['referencedItem']['type'] ?? ''));
      if ($refTitle !== '' && $refUrl !== '') {
        $referencedItem = [
          'title' => mb_substr($refTitle, 0, 180),
          'url' => $refUrl,
          'type' => mb_substr($refType, 0, 40),
        ];
      }
    }
    $sources = [];
    if (!empty($item['sources']) && is_array($item['sources'])) {
      foreach ($item['sources'] as $src) {
        if (!is_array($src)) continue;
        $title = trim((string) ($src['title'] ?? ''));
        $url = trim((string) ($src['url'] ?? ''));
        $type = trim((string) ($src['type'] ?? ''));
        if ($title === '' || $url === '') continue;
        $sources[] = ['title' => mb_substr($title, 0, 180), 'url' => $url, 'type' => mb_substr($type, 0, 40)];
      }
      if (count($sources) > 3) {
        $sources = array_slice($sources, 0, 3);
      }
    }
    $clean[] = [
      'role' => $role,
      'text' => mb_substr($text, 0, 1200),
      'sources' => $sources,
      'referencedItem' => $referencedItem,
      'listedItems' => $listedItems,
    ];
  }
  // Keep recent turns only (single session memory window)
  if (count($clean) > 8) {
    $clean = array_slice($clean, -8);
  }
  return $clean;
}

function chatbot_is_source_request($question) {
  $q = strtolower(trim((string) $question));
  $patterns = [
    '/\blink\b/',
    '/\bsource\b/',
    '/\breference\b/',
    '/\burl\b/',
    '/\bwhere can i read\b/',
    '/\bread more\b/',
    '/\bwhich article\b/',
    '/\bshow me\b.*\blink/',
    '/\bwhere is\b.*\barticl/',
  ];
  foreach ($patterns as $pattern) {
    if (preg_match($pattern, $q)) return true;
  }
  return false;
}

function chatbot_recent_sources_from_history($history) {
  for ($i = count($history) - 1; $i >= 0; $i--) {
    if (($history[$i]['role'] ?? '') !== 'assistant') continue;
    $sources = $history[$i]['sources'] ?? [];
    if (is_array($sources) && !empty($sources)) {
      return array_slice($sources, 0, 3);
    }
  }
  return [];
}

function chatbot_link_scope_from_question($question) {
  $q = strtolower(trim((string) $question));
  if (preg_match('/\bopportunit(?:y|ies|i|u)\b/', $q)) return 'opportunity';
  if (preg_match('/\barticle|news|story|stories\b/', $q)) return 'article';
  if (preg_match('/\btender(?:s)?\b/', $q)) return 'tender';
  if (preg_match('/\bprocurement(?:s)?\b/', $q)) return 'procurement';
  return '';
}

function chatbot_filter_items_by_scope($items, $scope) {
  if ($scope === '') return $items;
  $filtered = array_values(array_filter($items, function($it) use ($scope) {
    return strtolower(trim((string) ($it['type'] ?? ''))) === $scope;
  }));
  return !empty($filtered) ? $filtered : $items;
}

function chatbot_recent_listed_items_from_history($history, $scope = '') {
  for ($i = count($history) - 1; $i >= 0; $i--) {
    if (($history[$i]['role'] ?? '') !== 'assistant') continue;
    $items = $history[$i]['listedItems'] ?? [];
    if (is_array($items) && !empty($items)) {
      return array_slice(chatbot_filter_items_by_scope($items, $scope), 0, 8);
    }
  }
  return [];
}

function chatbot_is_singular_link_reference($question) {
  $q = strtolower(trim((string) $question));
  if (!chatbot_is_source_request($q)) return false;
  return preg_match('/\b(?:it|that|this)\b/', $q) === 1;
}

function chatbot_recent_referenced_item_from_history($history) {
  for ($i = count($history) - 1; $i >= 0; $i--) {
    if (($history[$i]['role'] ?? '') !== 'assistant') continue;
    $ref = $history[$i]['referencedItem'] ?? null;
    if (is_array($ref) && !empty($ref['title']) && !empty($ref['url'])) {
      return $ref;
    }
  }
  return null;
}

function chatbot_last_assistant_text_from_history($history) {
  for ($i = count($history) - 1; $i >= 0; $i--) {
    if (($history[$i]['role'] ?? '') === 'assistant' && !empty($history[$i]['text'])) {
      return trim((string) $history[$i]['text']);
    }
  }
  return '';
}

function chatbot_is_greeting($text) {
  $q = strtolower(trim((string) $text));
  return preg_match('/^(?:hi|hello|hey|good morning|good afternoon|good evening)\b/', $q) === 1;
}

function chatbot_normalize_for_similarity($text) {
  $x = strtolower(trim((string) $text));
  $x = preg_replace('/\s+/', ' ', $x);
  $x = preg_replace('/[^a-z0-9 ]/', '', $x);
  return trim((string) $x);
}

function chatbot_identity_reply_if_needed($question) {
  $q = strtolower(trim((string) $question));
  if (preg_match('/\b(?:boy|girl|male|female|gender|man|woman)\b/', $q) && preg_match('/\b(?:are you|you a|you an)\b/', $q)) {
    return "I'm an AI assistant, so I don't have a gender. I'm here to help you with BizGrowth Africa content.";
  }
  if (preg_match('/\bwho are you\b|\bwhat are you\b/', $q)) {
    return "I'm BizGrowth Assistant. I can help with articles, opportunities, procurements, and tenders on this website.";
  }
  return '';
}

function chatbot_has_relative_yesterday_opportunity_intent($question) {
  $q = strtolower(trim((string) $question));
  $isYesterday = preg_match('/\byesterday\b/', $q) === 1;
  $isOpportunity = preg_match('/\bopportunit(?:y|ies|i|u)\b/', $q) === 1;
  return $isYesterday && $isOpportunity;
}

function chatbot_parse_timestamp($value) {
  $v = trim((string) $value);
  if ($v === '') return 0;
  $ts = strtotime($v);
  return $ts === false ? 0 : (int) $ts;
}

function chatbot_day_window_yesterday_utc($tzOffsetHours = 1) {
  $offset = (int) $tzOffsetHours * 3600;
  $nowLocal = time() + $offset;
  $startOfTodayLocal = strtotime('today', $nowLocal);
  $startOfYesterdayLocal = strtotime('-1 day', $startOfTodayLocal);
  $endOfYesterdayLocal = $startOfTodayLocal - 1;
  return [
    'startUtc' => $startOfYesterdayLocal - $offset,
    'endUtc' => $endOfYesterdayLocal - $offset,
  ];
}

function chatbot_day_window_for_local_date_utc($tzOffsetHours = 1, $timezoneName = '', $offsetDays = 0) {
  $tz = null;
  if (is_string($timezoneName) && trim($timezoneName) !== '') {
    try {
      $tz = new DateTimeZone(trim($timezoneName));
    } catch (Exception $e) {
      $tz = null;
    }
  }
  if ($tz === null) {
    $sign = ((int) $tzOffsetHours) >= 0 ? '+' : '-';
    $hours = str_pad((string) abs((int) $tzOffsetHours), 2, '0', STR_PAD_LEFT);
    $tz = new DateTimeZone("{$sign}{$hours}:00");
  }

  $now = new DateTimeImmutable('now', $tz);
  $target = $now->modify(((int) $offsetDays) . ' day');
  $startLocal = $target->setTime(0, 0, 0);
  $endLocal = $target->setTime(23, 59, 59);

  return [
    'startUtc' => $startLocal->setTimezone(new DateTimeZone('UTC'))->getTimestamp(),
    'endUtc' => $endLocal->setTimezone(new DateTimeZone('UTC'))->getTimestamp(),
    'localDate' => $target->format('Y-m-d'),
    'localDayName' => $target->format('l'),
  ];
}

function chatbot_now_context($tzOffsetHours = 1, $timezoneName = '') {
  $tz = null;
  if (is_string($timezoneName) && trim($timezoneName) !== '') {
    try {
      $tz = new DateTimeZone(trim($timezoneName));
    } catch (Exception $e) {
      $tz = null;
    }
  }

  if ($tz === null) {
    $sign = ((int) $tzOffsetHours) >= 0 ? '+' : '-';
    $hours = str_pad((string) abs((int) $tzOffsetHours), 2, '0', STR_PAD_LEFT);
    $tz = new DateTimeZone("{$sign}{$hours}:00");
  }

  $now = new DateTimeImmutable('now', $tz);
  return [
    'iso' => $now->format(DateTimeInterface::ATOM),
    'date' => $now->format('Y-m-d'),
    'time' => $now->format('H:i:s'),
    'timeHuman' => $now->format('g:i A'),
    'dayName' => $now->format('l'),
    'dateHuman' => $now->format('j F Y'),
    'timezone' => $tz->getName(),
  ];
}

function chatbot_timezone_human_label($timezone, $isoDateTime) {
  $tz = trim((string) $timezone);
  if ($tz === '') return 'UTC';

  // Friendly names for common zones used by this project.
  $friendlyMap = [
    'Africa/Lagos' => 'West Africa Time (UTC plus 1 hour)',
    'UTC' => 'Coordinated Universal Time (UTC)',
    'GMT' => 'Greenwich Mean Time (UTC)',
  ];
  if (isset($friendlyMap[$tz])) {
    return $friendlyMap[$tz];
  }

  // If timezone is an offset like +01:00 / -05:00, convert to words.
  if (preg_match('/^([+-])(\d{2}):(\d{2})$/', $tz, $m)) {
    $signWord = $m[1] === '+' ? 'plus' : 'minus';
    $h = (int) $m[2];
    $min = (int) $m[3];
    if ($min === 0) {
      return "UTC {$signWord} {$h} hour" . ($h === 1 ? '' : 's');
    }
    return "UTC {$signWord} {$h} hour" . ($h === 1 ? '' : 's') . " and {$min} minute" . ($min === 1 ? '' : 's');
  }

  // For named zones, include offset words too.
  try {
    $dt = new DateTimeImmutable($isoDateTime);
    $zone = new DateTimeZone($tz);
    $zdt = $dt->setTimezone($zone);
    $offsetSeconds = $zone->getOffset($zdt);
    $signWord = $offsetSeconds >= 0 ? 'plus' : 'minus';
    $abs = abs($offsetSeconds);
    $h = intdiv($abs, 3600);
    $min = intdiv($abs % 3600, 60);
    if ($min === 0) {
      return "{$tz} (UTC {$signWord} {$h} hour" . ($h === 1 ? '' : 's') . ")";
    }
    return "{$tz} (UTC {$signWord} {$h} hour" . ($h === 1 ? '' : 's') . " and {$min} minute" . ($min === 1 ? '' : 's') . ")";
  } catch (Exception $e) {
    return $tz;
  }
}

function chatbot_scope_candidates_from_question($question) {
  $q = strtolower(trim((string) $question));
  $scopes = [];
  if (preg_match('/\barticle|news|story|stories\b/', $q)) $scopes[] = 'article';
  if (preg_match('/\bopportunit(?:y|ies|i|u)\b/', $q)) $scopes[] = 'opportunity';
  if (preg_match('/\btender(?:s)?\b/', $q)) $scopes[] = 'tender';
  if (preg_match('/\bprocurement(?:s)?\b/', $q)) $scopes[] = 'procurement';
  return array_values(array_unique($scopes));
}

function chatbot_has_relative_today_intent($question) {
  $q = strtolower(trim((string) $question));
  return preg_match('/\btoday\b|\bcurrent day\b|\bposted today\b|\bpost today\b/', $q) === 1;
}

function chatbot_is_current_date_question($question) {
  $q = strtolower(trim((string) $question));
  if ($q === '') return false;
  return preg_match('/\bwhat(?:\'s| is)\s+(?:today|todays|today\'s)\s+(?:date|day)\b|\bwhat is today\b|\bwhat day is it\b|\bwhat(?:\'s| is)\s+the date\b|\bdate today\b/', $q) === 1;
}

function chatbot_has_relative_this_week_intent($question) {
  $q = strtolower(trim((string) $question));
  return preg_match('/\bthis week\b|\bcurrent week\b/', $q) === 1;
}

function chatbot_has_relative_this_month_intent($question) {
  $q = strtolower(trim((string) $question));
  return preg_match('/\bthis month\b|\bcurrent month\b/', $q) === 1;
}

function chatbot_has_relative_last_7_days_intent($question) {
  $q = strtolower(trim((string) $question));
  return preg_match('/\blast 7 days\b|\blast seven days\b|\bpast 7 days\b|\bpast seven days\b/', $q) === 1;
}

function chatbot_date_window_for_range_utc($rangeType, $tzOffsetHours = 1, $timezoneName = '') {
  $tz = null;
  if (is_string($timezoneName) && trim($timezoneName) !== '') {
    try {
      $tz = new DateTimeZone(trim($timezoneName));
    } catch (Exception $e) {
      $tz = null;
    }
  }
  if ($tz === null) {
    $sign = ((int) $tzOffsetHours) >= 0 ? '+' : '-';
    $hours = str_pad((string) abs((int) $tzOffsetHours), 2, '0', STR_PAD_LEFT);
    $tz = new DateTimeZone("{$sign}{$hours}:00");
  }

  $now = new DateTimeImmutable('now', $tz);
  switch ($rangeType) {
    case 'week':
      $startLocal = $now->modify('monday this week')->setTime(0, 0, 0);
      $endLocal = $now->setTime(23, 59, 59);
      break;
    case 'month':
      $startLocal = $now->modify('first day of this month')->setTime(0, 0, 0);
      $endLocal = $now->setTime(23, 59, 59);
      break;
    case 'last7':
      $startLocal = $now->modify('-6 day')->setTime(0, 0, 0); // includes today + previous 6 days
      $endLocal = $now->setTime(23, 59, 59);
      break;
    default:
      $startLocal = $now->setTime(0, 0, 0);
      $endLocal = $now->setTime(23, 59, 59);
      break;
  }

  return [
    'startUtc' => $startLocal->setTimezone(new DateTimeZone('UTC'))->getTimestamp(),
    'endUtc' => $endLocal->setTimezone(new DateTimeZone('UTC'))->getTimestamp(),
  ];
}

function chatbot_scope_label($scopes) {
  if (!is_array($scopes) || empty($scopes)) return 'items';
  if (count($scopes) === 1) {
    $map = [
      'article' => 'news articles',
      'opportunity' => 'opportunities',
      'tender' => 'tenders',
      'procurement' => 'procurements',
    ];
    return $map[$scopes[0]] ?? 'items';
  }
  return 'items';
}

function chatbot_is_show_me_request($question) {
  $q = strtolower(trim((string) $question));
  return preg_match('/\bshow me\b|\bcan i see\b|\blet me see\b/', $q) === 1;
}

function chatbot_requests_latest($question) {
  $q = strtolower(trim((string) $question));
  return preg_match('/\blatest\b|\blastest\b|\bnewest\b|\brecent\b/', $q) === 1;
}

function chatbot_infer_recent_scope_from_history($history) {
  for ($i = count($history) - 1; $i >= 0; $i--) {
    if (($history[$i]['role'] ?? '') !== 'user') continue;
    $text = trim((string) ($history[$i]['text'] ?? ''));
    if ($text === '') continue;
    $scopes = chatbot_scope_candidates_from_question($text);
    if (!empty($scopes)) {
      return $scopes;
    }
  }
  return [];
}

function chatbot_range_label($rangeType) {
  if ($rangeType === 'week') return 'this week';
  if ($rangeType === 'month') return 'this month';
  if ($rangeType === 'last7') return 'the last 7 days';
  return 'today';
}

function chatbot_build_query_with_history($question, $history) {
  $q = trim((string) $question);
  if (empty($history)) {
    return $q;
  }

  $followUpPatterns = [
    '/\belaborate\b/i',
    '/\bmore\b/i',
    '/\bexpand\b/i',
    '/\bexplain\b.*\bmore\b/i',
    '/\bthat\b/i',
    '/\bit\b/i',
    '/\bthis\b/i',
    '/\bcontinue\b/i',
    '/\bgo on\b/i',
  ];
  $isFollowUp = mb_strlen($q) <= 50;
  foreach ($followUpPatterns as $pattern) {
    if (preg_match($pattern, $q)) {
      $isFollowUp = true;
      break;
    }
  }

  if (!$isFollowUp) {
    return $q;
  }

  $lastUser = '';
  $lastAssistant = '';
  $lastReferencedTitle = '';
  for ($i = count($history) - 1; $i >= 0; $i--) {
    if ($lastUser === '' && $history[$i]['role'] === 'user') {
      $lastUser = $history[$i]['text'];
      continue;
    }
    if ($lastAssistant === '' && $history[$i]['role'] === 'assistant') {
      $lastAssistant = $history[$i]['text'];
    }
    if ($lastReferencedTitle === '' && $history[$i]['role'] === 'assistant') {
      $ref = $history[$i]['referencedItem'] ?? null;
      if (is_array($ref) && !empty($ref['title'])) {
        $lastReferencedTitle = trim((string) $ref['title']);
      }
    }
    if ($lastUser !== '' && $lastAssistant !== '' && $lastReferencedTitle !== '') break;
  }

  $parts = array_filter([
    $q,
    $lastUser !== '' ? "Previous user request: {$lastUser}" : '',
    $lastAssistant !== '' ? "Previous assistant answer: {$lastAssistant}" : '',
    $lastReferencedTitle !== '' ? "Last referenced item: {$lastReferencedTitle}" : '',
  ]);
  return implode("\n", $parts);
}

function chatbot_row_to_doc($sheet, $row) {
  $title = trim((string) ($row['title'] ?? ''));
  if ($title === '') return null;
  $status = strtolower(trim((string) ($row['status'] ?? '')));
  if ($status === 'draft' || $status === 'scheduled') return null;
  $publishedAt =
    trim((string) ($row['scheduledat'] ?? '')) ?:
    trim((string) ($row['scheduledAt'] ?? '')) ?:
    trim((string) ($row['createdat'] ?? '')) ?:
    trim((string) ($row['createdAt'] ?? ''));

  if ($sheet === 'Articles') {
    $slug = trim((string) ($row['slug'] ?? ''));
    if ($slug === '') return null;
    $url = '/news/' . $slug;
    $content = implode("\n\n", array_filter([
      $title,
      chatbot_strip_html($row['summary'] ?? ''),
      chatbot_strip_html($row['subheading'] ?? ''),
      chatbot_strip_html($row['content'] ?? ''),
      chatbot_strip_html($row['whyitmatters'] ?? $row['whyItMatters'] ?? '')
    ]));
    return ['type' => 'article', 'title' => $title, 'url' => $url, 'content' => $content, 'publishedAt' => $publishedAt];
  }

  if ($sheet === 'Opportunities') {
    $id = trim((string) ($row['id'] ?? ('opp-' . chatbot_slugify($title))));
    $url = '/opportunities/' . rawurlencode($id);
    $content = implode("\n\n", array_filter([
      $title,
      chatbot_strip_html($row['org'] ?? ''),
      chatbot_strip_html($row['category'] ?? ''),
      chatbot_strip_html($row['country'] ?? ''),
      chatbot_strip_html($row['region'] ?? ''),
      chatbot_strip_html($row['deadline'] ?? ''),
      chatbot_strip_html($row['description'] ?? '')
    ]));
    return ['type' => 'opportunity', 'title' => $title, 'url' => $url, 'content' => $content, 'publishedAt' => $publishedAt];
  }

  if ($sheet === 'Tenders') {
    $type = strtolower(trim((string) ($row['type'] ?? '')));
    if ($type !== '' && $type !== 'tender') return null;
    $id = trim((string) ($row['id'] ?? ('tender-' . chatbot_slugify($title))));
    $url = '/procurement-tenders/' . rawurlencode($id);
    $content = implode("\n\n", array_filter([
      $title,
      chatbot_strip_html($row['agency'] ?? ''),
      chatbot_strip_html($row['category'] ?? ''),
      chatbot_strip_html($row['country'] ?? ''),
      chatbot_strip_html($row['region'] ?? ''),
      chatbot_strip_html($row['deadline'] ?? ''),
      chatbot_strip_html($row['quicksummary'] ?? $row['quickSummary'] ?? ''),
      chatbot_strip_html($row['description'] ?? '')
    ]));
    return ['type' => 'tender', 'title' => $title, 'url' => $url, 'content' => $content, 'publishedAt' => $publishedAt];
  }

  if ($sheet === 'Procurements') {
    $id = trim((string) ($row['id'] ?? ('proc-' . chatbot_slugify($title))));
    $url = '/procurement-tenders/' . rawurlencode($id);
    $content = implode("\n\n", array_filter([
      $title,
      chatbot_strip_html($row['agency'] ?? ''),
      chatbot_strip_html($row['category'] ?? ''),
      chatbot_strip_html($row['country'] ?? ''),
      chatbot_strip_html($row['region'] ?? ''),
      chatbot_strip_html($row['deadline'] ?? ''),
      chatbot_strip_html($row['quicksummary'] ?? $row['quickSummary'] ?? ''),
      chatbot_strip_html($row['description'] ?? '')
    ]));
    return ['type' => 'procurement', 'title' => $title, 'url' => $url, 'content' => $content, 'publishedAt' => $publishedAt];
  }

  return null;
}

function chatbot_snapshot_rows($sheetName) {
  $sheet = snapshot_read_sheet_data($sheetName);
  if (!is_array($sheet) || !isset($sheet['values']) || !is_array($sheet['values']) || count($sheet['values']) < 2) {
    return [];
  }
  $headers = array_map(function($h) { return strtolower(trim((string) $h)); }, $sheet['values'][0]);
  $rows = [];
  for ($i = 1; $i < count($sheet['values']); $i++) {
    $vals = $sheet['values'][$i];
    $obj = [];
    foreach ($headers as $idx => $key) {
      if ($key === '') continue;
      $obj[$key] = isset($vals[$idx]) ? trim((string) $vals[$idx]) : '';
    }
    $rows[] = $obj;
  }
  return $rows;
}

$history = chatbot_clean_history($rawHistory);
$lastAssistantText = chatbot_last_assistant_text_from_history($history);
$clientIp = chatbot_client_ip();

$rateLimitPerMinute = (int) chatbot_setting('CHAT_RATE_LIMIT_PER_MIN', '20');
list($rateOk, $rateRemaining) = chatbot_check_rate_limit($clientIp, $rateLimitPerMinute);
if (!$rateOk) {
  json_ok(chatbot_guardrail_response(
    "Chat is busy right now. Please wait a moment and try again.",
    'rate_limit',
    ['retryAfterSec' => 60, 'limitPerMinute' => $rateLimitPerMinute, 'remaining' => $rateRemaining]
  ));
}

$dailyLimit = (int) chatbot_setting('CHAT_DAILY_LIMIT', '5000');
list($dailyOk, $dailyRemaining) = chatbot_check_daily_limit($dailyLimit);
if (!$dailyOk) {
  json_ok(chatbot_guardrail_response(
    "Today's chatbot capacity is full. Please try again later.",
    'daily_limit',
    ['limitPerDay' => $dailyLimit, 'remaining' => $dailyRemaining]
  ));
}

$responseCacheTtlSec = (int) chatbot_setting('CHAT_RESPONSE_CACHE_TTL_SEC', '300');
$responseCacheKey = chatbot_cache_key($provider, $question, $history);
$cachedResponse = chatbot_cache_get($responseCacheKey, $responseCacheTtlSec);
if (is_array($cachedResponse) && isset($cachedResponse['answer'])) {
  json_ok($cachedResponse);
}

$model = chatbot_select_model($model, $question);

$docs = [];
foreach (['Articles', 'Opportunities', 'Tenders', 'Procurements'] as $sheet) {
  $rows = chatbot_snapshot_rows($sheet);
  foreach ($rows as $row) {
    $doc = chatbot_row_to_doc($sheet, $row);
    if ($doc && $doc['content'] !== '') $docs[] = $doc;
  }
}

if (empty($docs)) {
  json_error('No published content available for chatbot context', 503);
}

$identityReply = chatbot_identity_reply_if_needed($question);
if ($identityReply !== '') {
  $payload = [
    'answer' => $identityReply,
    'sources' => [],
    'referencedItem' => null,
    'listedItems' => [],
  ];
  if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
  json_ok($payload);
}

$tzOffset = (int) chatbot_setting('CHAT_TIMEZONE_OFFSET_HOURS', '1');
$tzName = chatbot_setting('CHAT_TIMEZONE', '');
$nowContext = chatbot_now_context($tzOffset, $tzName);

if (chatbot_is_current_date_question($question)) {
  $tzHuman = chatbot_timezone_human_label((string) ($nowContext['timezone'] ?? ''), (string) ($nowContext['iso'] ?? ''));
  $payload = [
    'answer' => "Today is {$nowContext['dayName']}, {$nowContext['dateHuman']}. The current time is {$nowContext['timeHuman']} in {$tzHuman}.",
    'sources' => [],
    'referencedItem' => null,
    'listedItems' => [],
  ];
  if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
  json_ok($payload);
}

foreach ($docs as &$doc) {
  $doc['_publishedTs'] = chatbot_parse_timestamp($doc['publishedAt'] ?? '');
}
unset($doc);

if (chatbot_has_relative_yesterday_opportunity_intent($question)) {
  $window = chatbot_day_window_yesterday_utc($tzOffset);
  $matches = array_values(array_filter($docs, function($d) use ($window) {
    if (($d['type'] ?? '') !== 'opportunity') return false;
    $ts = (int) ($d['_publishedTs'] ?? 0);
    if ($ts <= 0) return false;
    return $ts >= $window['startUtc'] && $ts <= $window['endUtc'];
  }));
  usort($matches, function($a, $b) {
    return ((int) ($b['_publishedTs'] ?? 0)) - ((int) ($a['_publishedTs'] ?? 0));
  });
  $listed = array_slice(array_map(function($m) {
    return ['title' => $m['title'], 'url' => $m['url'], 'type' => $m['type']];
  }, $matches), 0, 5);

  if (!empty($listed)) {
    $bullets = array_map(function($m) { return "- " . $m['title']; }, $listed);
    $payload = [
      'answer' => "Here are yesterday's opportunities I found:\n\n" . implode("\n", $bullets),
      'sources' => array_slice($listed, 0, 3),
      'referencedItem' => $listed[0],
      'listedItems' => $listed,
    ];
    if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
    json_ok($payload);
  }

  $payload = [
    'answer' => "I couldn't find any opportunities published yesterday in the available content. If you want, I can show the latest opportunities instead.",
    'sources' => [],
    'referencedItem' => null,
    'listedItems' => [],
  ];
  if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
  json_ok($payload);
}

if (chatbot_has_relative_today_intent($question)) {
  $scopes = chatbot_scope_candidates_from_question($question);
  $windowToday = chatbot_day_window_for_local_date_utc($tzOffset, $tzName, 0);
  $matches = array_values(array_filter($docs, function($d) use ($windowToday, $scopes) {
    $type = strtolower(trim((string) ($d['type'] ?? '')));
    if (!empty($scopes) && !in_array($type, $scopes, true)) return false;
    $ts = (int) ($d['_publishedTs'] ?? 0);
    if ($ts <= 0) return false;
    return $ts >= $windowToday['startUtc'] && $ts <= $windowToday['endUtc'];
  }));
  usort($matches, function($a, $b) {
    return ((int) ($b['_publishedTs'] ?? 0)) - ((int) ($a['_publishedTs'] ?? 0));
  });

  $listed = array_slice(array_map(function($m) {
    return ['title' => $m['title'], 'url' => $m['url'], 'type' => $m['type']];
  }, $matches), 0, 8);

  if (!empty($listed)) {
    $label = chatbot_scope_label($scopes);
    $bullets = array_map(function($m) { return "- " . $m['title']; }, $listed);
    $payload = [
      'answer' => "Here are {$label} posted today:\n\n" . implode("\n", $bullets),
      'sources' => array_slice($listed, 0, 5),
      'referencedItem' => $listed[0],
      'listedItems' => $listed,
    ];
    if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
    json_ok($payload);
  }

  $label = chatbot_scope_label($scopes);
  $payload = [
    'answer' => "I couldn't find any {$label} posted today in the available content. If you want, I can show the latest instead.",
    'sources' => [],
    'referencedItem' => null,
    'listedItems' => [],
  ];
  if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
  json_ok($payload);
}

$historyScoped = chatbot_infer_recent_scope_from_history($history);
if (chatbot_is_show_me_request($question) && (chatbot_requests_latest($question) || !empty($historyScoped))) {
  $scopes = chatbot_scope_candidates_from_question($question);
  if (empty($scopes)) {
    $scopes = $historyScoped;
  }
  $matches = array_values(array_filter($docs, function($d) use ($scopes) {
    if (empty($scopes)) return true;
    $type = strtolower(trim((string) ($d['type'] ?? '')));
    return in_array($type, $scopes, true);
  }));
  usort($matches, function($a, $b) {
    return ((int) ($b['_publishedTs'] ?? 0)) - ((int) ($a['_publishedTs'] ?? 0));
  });

  $listed = array_slice(array_map(function($m) {
    return ['title' => $m['title'], 'url' => $m['url'], 'type' => $m['type']];
  }, $matches), 0, 8);

  if (!empty($listed)) {
    $label = chatbot_scope_label($scopes);
    $bullets = array_map(function($m) { return "- " . $m['title']; }, $listed);
    $payload = [
      'answer' => "Here are the latest {$label}:\n\n" . implode("\n", $bullets),
      'sources' => array_slice($listed, 0, 5),
      'referencedItem' => $listed[0],
      'listedItems' => $listed,
    ];
    if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
    json_ok($payload);
  }
}

$rangeType = '';
if (chatbot_has_relative_this_week_intent($question)) {
  $rangeType = 'week';
} elseif (chatbot_has_relative_this_month_intent($question)) {
  $rangeType = 'month';
} elseif (chatbot_has_relative_last_7_days_intent($question)) {
  $rangeType = 'last7';
}

if ($rangeType !== '') {
  $scopes = chatbot_scope_candidates_from_question($question);
  $window = chatbot_date_window_for_range_utc($rangeType, $tzOffset, $tzName);
  $matches = array_values(array_filter($docs, function($d) use ($window, $scopes) {
    $type = strtolower(trim((string) ($d['type'] ?? '')));
    if (!empty($scopes) && !in_array($type, $scopes, true)) return false;
    $ts = (int) ($d['_publishedTs'] ?? 0);
    if ($ts <= 0) return false;
    return $ts >= $window['startUtc'] && $ts <= $window['endUtc'];
  }));
  usort($matches, function($a, $b) {
    return ((int) ($b['_publishedTs'] ?? 0)) - ((int) ($a['_publishedTs'] ?? 0));
  });

  $listed = array_slice(array_map(function($m) {
    return ['title' => $m['title'], 'url' => $m['url'], 'type' => $m['type']];
  }, $matches), 0, 8);

  $scopeLabel = chatbot_scope_label($scopes);
  $rangeLabel = chatbot_range_label($rangeType);

  if (!empty($listed)) {
    $bullets = array_map(function($m) { return "- " . $m['title']; }, $listed);
    $payload = [
      'answer' => "Here are {$scopeLabel} posted {$rangeLabel}:\n\n" . implode("\n", $bullets),
      'sources' => array_slice($listed, 0, 5),
      'referencedItem' => $listed[0],
      'listedItems' => $listed,
    ];
    if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
    json_ok($payload);
  }

  $payload = [
    'answer' => "I couldn't find any {$scopeLabel} posted {$rangeLabel} in the available content. If you want, I can show the latest instead.",
    'sources' => [],
    'referencedItem' => null,
    'listedItems' => [],
  ];
  if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
  json_ok($payload);
}

$recentReferencedItem = chatbot_recent_referenced_item_from_history($history);
$recentHistorySources = chatbot_recent_sources_from_history($history);
$linkScope = chatbot_link_scope_from_question($question);
$recentListedItems = chatbot_recent_listed_items_from_history($history, $linkScope);
if (chatbot_is_source_request($question)) {
  $resolvedSources = [];
  $isSingularLinkRef = chatbot_is_singular_link_reference($question);
  if ($isSingularLinkRef && is_array($recentReferencedItem) && !empty($recentReferencedItem['title']) && !empty($recentReferencedItem['url'])) {
    $resolvedSources[] = $recentReferencedItem;
  } elseif (!empty($recentListedItems)) {
    $resolvedSources = array_slice($recentListedItems, 0, 5);
  } elseif (is_array($recentReferencedItem) && !empty($recentReferencedItem['title']) && !empty($recentReferencedItem['url'])) {
    $resolvedSources[] = $recentReferencedItem;
  } elseif (!empty($recentHistorySources)) {
    $resolvedSources = array_slice(chatbot_filter_items_by_scope($recentHistorySources, $linkScope), 0, 5);
  }
  if (!empty($resolvedSources)) {
    $lead = count($resolvedSources) === 1
      ? "Sure, here is the link:"
      : "Sure, here are the relevant links:";
    $bullets = [];
    foreach ($resolvedSources as $src) {
      $bullets[] = "- " . trim((string) ($src['title'] ?? ''));
    }
    $answerText = $lead . "\n\n" . implode("\n", $bullets);
    $payload = [
      'answer' => $answerText,
      'sources' => array_slice($resolvedSources, 0, 5),
      'referencedItem' => $resolvedSources[0],
      'listedItems' => array_slice($resolvedSources, 0, 5),
    ];
    if ($responseCacheTtlSec > 0) chatbot_cache_put($responseCacheKey, $payload);
    json_ok($payload);
  }
}

$retrievalQuery = chatbot_build_query_with_history($question, $history);

$qTokens = chatbot_tokenize($retrievalQuery);
foreach ($docs as &$doc) {
  $hay = strtolower(($doc['title'] ?? '') . ' ' . ($doc['content'] ?? '') . ' ' . ($doc['type'] ?? ''));
  $score = 0;
  foreach ($qTokens as $t) {
    if (strpos($hay, $t) !== false) $score += 1;
  }
  if (strpos(strtolower((string) $doc['title']), strtolower($question)) !== false) $score += 3;
  $doc['_score'] = $score;
}
unset($doc);

usort($docs, function($a, $b) {
  if (($b['_score'] ?? 0) !== ($a['_score'] ?? 0)) return ($b['_score'] ?? 0) - ($a['_score'] ?? 0);
  return strcmp((string) ($a['title'] ?? ''), (string) ($b['title'] ?? ''));
});

$top = array_slice(array_values(array_filter($docs, function($d) { return ($d['_score'] ?? 0) > 0; })), 0, 6);
if (empty($top)) $top = array_slice($docs, 0, 4);

$contextParts = [];
foreach ($top as $i => $d) {
  $snippet = mb_substr((string) $d['content'], 0, 1400);
  $contextParts[] = "[" . ($i + 1) . "] TYPE: {$d['type']}\nTITLE: {$d['title']}\nURL: {$d['url']}\nCONTENT:\n{$snippet}";
}
$contextText = implode("\n\n---\n\n", $contextParts);

$developerMsg = "You are the BizGrowth Africa website assistant.\n"
  . "You must answer ONLY from the provided BizGrowth Africa context snippets.\n"
  . "Use the provided CURRENT_DATETIME for any time-sensitive phrasing (today, yesterday, this week, deadlines), not model assumptions.\n"
  . "Do not use outside knowledge, and do not invent facts.\n"
  . "Speak in a very polite, warm, conversational style like a helpful assistant.\n"
  . "Handle casual slang naturally with short, friendly wording.\n"
  . "Only greet when the user greeting is in the current message. Do not repeat greetings on follow-up turns.\n"
  . "Never repeat onboarding lines such as 'Ask me about BizGrowth Africa articles, opportunities, procurements, and tenders.'\n"
  . "Do NOT say phrases like 'based on the provided context', 'from the context', 'source [1]', or similar internal wording.\n"
  . "Prefer short paragraphs over bullet points unless the user asked for a list.\n"
  . "When mentioning multiple article titles, format them clearly on separate lines (or bullets), never as one merged line.\n"
  . "If the user message is vague or has no clear question, respond naturally and ask one clarifying question.\n"
  . "Do not include links in every reply. Include links when the user asks for them, or when you provide factual claims (numbers, statistics, dates, percentages, rankings, GDP/inflation/market metrics) so users can verify.\n"
  . "Use recent chat history in this same session to resolve follow-up references like 'elaborate more', 'that', or 'continue'.\n"
  . "Adapt response length to user need:\n"
  . "- Short (1-3 sentences) for simple or direct questions.\n"
  . "- Medium (1-2 short paragraphs) for most normal questions.\n"
  . "- Longer structured responses only when the user asks for detail, comparison, explanation, strategy, or step-by-step help.\n"
  . "Avoid unnecessary verbosity.\n"
  . "If the answer is not in context, say exactly: \"I can only answer from BizGrowth Africa content, and I couldn't find that yet.\"\n"
  . "Keep responses concise and useful.";

$historyText = '';
if (!empty($history)) {
  $lines = [];
  foreach ($history as $turn) {
    $speaker = $turn['role'] === 'assistant' ? 'Assistant' : 'User';
    $lines[] = "{$speaker}: {$turn['text']}";
  }
  $historyText = implode("\n", $lines);
}

$userMsg = "CURRENT QUESTION:\n{$question}\n\n"
  . "CURRENT_DATETIME:\n"
  . "- ISO: {$nowContext['iso']}\n"
  . "- Day: {$nowContext['dayName']}\n"
  . "- Date: {$nowContext['date']}\n"
  . "- Time: {$nowContext['time']}\n"
  . "- Timezone: {$nowContext['timezone']}\n\n"
  . (!empty($historyText) ? "RECENT CHAT HISTORY (same session):\n{$historyText}\n\n" : "")
  . "CONTEXT:\n{$contextText}";

function chatbot_dynamic_max_tokens($question) {
  $q = strtolower(trim((string) $question));
  $length = strlen($q);

  $longIntentPatterns = [
    '/\bexplain\b/',
    '/\bdetails?\b/',
    '/\bcompare\b/',
    '/\banalysis\b/',
    '/\bstrategy\b/',
    '/\broadmap\b/',
    '/\bhow to\b/',
    '/\bstep(?:-|\s)?by(?:-|\s)?step\b/',
    '/\bcomprehensive\b/',
  ];

  foreach ($longIntentPatterns as $pattern) {
    if (preg_match($pattern, $q)) {
      return 700;
    }
  }

  if ($length < 70) {
    return 260; // short answers for direct prompts
  }
  if ($length < 180) {
    return 420; // medium default
  }
  return 560; // more room for nuanced questions
}

$maxTokens = chatbot_dynamic_max_tokens($question);

$payload = [
  'model' => $model,
  'messages' => [
    ['role' => 'system', 'content' => $developerMsg],
    ['role' => 'user', 'content' => $userMsg]
  ],
  'temperature' => 0.2,
  'max_tokens' => $maxTokens
];

$ch = curl_init($chatUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 35);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$resp = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
  json_ok(chatbot_guardrail_response(
    "The assistant is temporarily unavailable. Please try again shortly.",
    'provider_unavailable'
  ));
}

$data = json_decode((string) $resp, true);
if ($http < 200 || $http >= 300 || !is_array($data)) {
  $msg = is_array($data) && isset($data['error']['message']) ? $data['error']['message'] : 'Chat provider error';
  if (chatbot_is_provider_quota_error($msg)) {
    json_ok(chatbot_guardrail_response(
      "The assistant has reached its usage limit for now. Please try again later.",
      'provider_quota'
    ));
  }
  json_error($msg, 502);
}

$answer = trim((string) ($data['choices'][0]['message']['content'] ?? ''));
if ($answer === '') {
  $answer = "I can only answer from BizGrowth Africa content, and I couldn't find that yet.";
}

function chatbot_remove_redundant_onboarding($answer) {
  $clean = (string) $answer;
  $phrases = [
    "Ask me about BizGrowth Africa articles, opportunities, procurements, and tenders.",
    "Ask me about BizGrowth Africa articles, opportunities, procurements, and tenders",
  ];
  foreach ($phrases as $p) {
    $clean = str_ireplace($p, '', $clean);
  }
  return trim((string) preg_replace('/\n{3,}/', "\n\n", $clean));
}

function chatbot_strip_leading_greeting($answer) {
  $clean = trim((string) $answer);
  // Remove up to two greeting-like lead sentences if present.
  for ($i = 0; $i < 2; $i++) {
    $next = preg_replace('/^(?:hi|hello|hey|good morning|good afternoon|good evening)\b[^.!?\n]*[.!?]\s*/iu', '', $clean, 1);
    if ($next === null || $next === $clean) {
      break;
    }
    $clean = trim($next);
  }
  return $clean;
}

$answer = chatbot_remove_redundant_onboarding($answer);
if (!chatbot_is_greeting($question)) {
  $stripped = chatbot_strip_leading_greeting($answer);
  if ($stripped !== '') {
    $answer = $stripped;
  }
}

$normalizedAnswer = chatbot_normalize_for_similarity($answer);
$normalizedLastAssistant = chatbot_normalize_for_similarity($lastAssistantText);
if ($normalizedAnswer !== '' && $normalizedAnswer === $normalizedLastAssistant) {
  if (chatbot_is_greeting($question)) {
    $answer = "Hi! Great to hear from you. How can I help you today?";
  } else {
    $answer = "Thanks for your message. Could you tell me a bit more so I can help with the exact item you mean?";
  }
}

function chatbot_is_factual_query($question) {
  $q = strtolower(trim((string) $question));
  $patterns = [
    '/\bgdp\b/',
    '/\binflation\b/',
    '/\bunemployment\b/',
    '/\binterest rate\b/',
    '/\bexchange rate\b/',
    '/\bdeficit\b/',
    '/\bdebt\b/',
    '/\bexports?\b/',
    '/\bimports?\b/',
    '/\bstat(?:s|istics)?\b/',
    '/\bdata\b/',
    '/\bhow much\b/',
    '/\bhow many\b/',
    '/\bcurrent\b/',
    '/\blatest\b/',
    '/\bpercentage\b/',
    '/\bpercent\b/',
  ];
  foreach ($patterns as $pattern) {
    if (preg_match($pattern, $q)) return true;
  }
  return false;
}

function chatbot_answer_has_factual_signals($answer) {
  $a = strtolower((string) $answer);
  $hasNumber = preg_match('/\d/', $a) === 1 || preg_match('/\b(?:million|billion|trillion|percent|%)\b/', $a) === 1;
  $hasMetricWord = preg_match('/\b(?:gdp|inflation|growth|rate|deficit|debt|exports?|imports?|economy)\b/', $a) === 1;
  return $hasNumber && $hasMetricWord;
}

function chatbot_sources_from_ranked_docs($docs) {
  $result = [];
  foreach ($docs as $d) {
    $title = trim((string) ($d['title'] ?? ''));
    $url = trim((string) ($d['url'] ?? ''));
    if ($title === '' || $url === '') {
      continue;
    }
    $result[] = [
      'title' => $title,
      'url' => $url,
      'type' => $d['type'] ?? ''
    ];
    if (count($result) >= 3) break;
  }
  return $result;
}

function chatbot_pick_referenced_item($sources, $topDocs) {
  if (is_array($sources) && !empty($sources)) {
    $first = $sources[0];
    if (!empty($first['title']) && !empty($first['url'])) {
      return [
        'title' => trim((string) $first['title']),
        'url' => trim((string) $first['url']),
        'type' => trim((string) ($first['type'] ?? '')),
      ];
    }
  }
  if (is_array($topDocs) && !empty($topDocs)) {
    $first = $topDocs[0];
    if (!empty($first['title']) && !empty($first['url'])) {
      return [
        'title' => trim((string) $first['title']),
        'url' => trim((string) $first['url']),
        'type' => trim((string) ($first['type'] ?? '')),
      ];
    }
  }
  return null;
}

function chatbot_pick_referenced_item_from_answer($answer, $sources, $topDocs) {
  $a = strtolower(trim((string) $answer));
  if ($a === '') return null;

  $candidates = [];
  foreach ([$sources, $topDocs] as $group) {
    if (!is_array($group)) continue;
    foreach ($group as $d) {
      $title = trim((string) ($d['title'] ?? ''));
      $url = trim((string) ($d['url'] ?? ''));
      if ($title === '' || $url === '') continue;
      $candidates[$url] = [
        'title' => $title,
        'url' => $url,
        'type' => trim((string) ($d['type'] ?? '')),
      ];
    }
  }

  foreach ($candidates as $item) {
    $titleLc = strtolower($item['title']);
    if ($titleLc !== '' && strpos($a, $titleLc) !== false) {
      return $item;
    }
    $parts = preg_split('/\s+/', $titleLc);
    if (is_array($parts) && count($parts) >= 3) {
      $prefix = trim(implode(' ', array_slice($parts, 0, 3)));
      if ($prefix !== '' && strpos($a, $prefix) !== false) {
        return $item;
      }
    }
  }

  return null;
}

function chatbot_listed_items_for_response($topDocs, $scope = '') {
  $docs = chatbot_filter_items_by_scope($topDocs, $scope);
  $items = [];
  foreach ($docs as $d) {
    $title = trim((string) ($d['title'] ?? ''));
    $url = trim((string) ($d['url'] ?? ''));
    if ($title === '' || $url === '') continue;
    $items[] = [
      'title' => $title,
      'url' => $url,
      'type' => $d['type'] ?? '',
    ];
    if (count($items) >= 5) break;
  }
  return $items;
}

function chatbot_should_store_listed_items($question, $answer, $sources) {
  if (is_array($sources) && count($sources) > 1) return true;
  $q = strtolower(trim((string) $question));
  $a = strtolower(trim((string) $answer));
  if (preg_match('/\b(?:list|show|latest|today|yesterday|happening)\b/', $q)) return true;
  if (preg_match('/\bhere are\b|\bthese are\b|\bopportunit(?:y|ies)\b/', $a)) return true;
  return false;
}

function chatbot_should_attach_sources($question, $answer) {
  $q = strtolower(trim((string) $question));
  $a = strtolower((string) $answer);

  if (chatbot_is_source_request($q)) {
    return true;
  }

  if (chatbot_is_factual_query($q) || chatbot_answer_has_factual_signals($a)) {
    return true;
  }

  if (preg_match('/\baccording to\b|\breported\b|\bestimate\b/', $a)) {
    return true;
  }

  if (preg_match('/\bwhere did you get\b|\bproof\b|\bverify\b/', $q)) {
    return true;
  }

  if (strpos($a, "i can only answer from bizgrowth africa content, and i couldn't find that yet.") !== false) {
    return true;
  }

  return false;
}

$sources = [];
if (chatbot_should_attach_sources($question, $answer)) {
  $scopedTopForSources = chatbot_filter_items_by_scope($top, chatbot_link_scope_from_question($question));
  $sources = chatbot_sources_from_ranked_docs($scopedTopForSources);
}
$referencedItem = chatbot_pick_referenced_item_from_answer($answer, $sources, $top);
if ($referencedItem === null) {
  $referencedItem = chatbot_pick_referenced_item($sources, $top);
}

$listedItems = [];
if (chatbot_should_store_listed_items($question, $answer, $sources)) {
  if (!empty($sources)) {
    $listedItems = array_slice($sources, 0, 5);
  } else {
    $listedItems = chatbot_listed_items_for_response($top, chatbot_link_scope_from_question($question));
  }
}

$responsePayload = [
  'answer' => $answer,
  'sources' => $sources,
  'referencedItem' => $referencedItem,
  'listedItems' => $listedItems,
];

if ($responseCacheTtlSec > 0) {
  chatbot_cache_put($responseCacheKey, $responsePayload);
}

json_ok($responsePayload);

