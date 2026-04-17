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

$history = chatbot_clean_history($rawHistory);
$lastAssistantText = chatbot_last_assistant_text_from_history($history);
$identityReply = chatbot_identity_reply_if_needed($question);
if ($identityReply !== '') {
  json_ok([
    'answer' => $identityReply,
    'sources' => [],
    'referencedItem' => null,
    'listedItems' => [],
  ]);
}

$tzOffset = (int) chatbot_setting('CHAT_TIMEZONE_OFFSET_HOURS', '1');
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
    json_ok([
      'answer' => "Here are yesterday's opportunities I found:\n\n" . implode("\n", $bullets),
      'sources' => array_slice($listed, 0, 3),
      'referencedItem' => $listed[0],
      'listedItems' => $listed,
    ]);
  }

  json_ok([
    'answer' => "I couldn't find any opportunities published yesterday in the available content. If you want, I can show the latest opportunities instead.",
    'sources' => [],
    'referencedItem' => null,
    'listedItems' => [],
  ]);
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
    json_ok([
      'answer' => $answerText,
      'sources' => array_slice($resolvedSources, 0, 5),
      'referencedItem' => $resolvedSources[0],
      'listedItems' => array_slice($resolvedSources, 0, 5),
    ]);
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
  json_error('Chat provider connection failed: ' . $err, 502);
}

$data = json_decode((string) $resp, true);
if ($http < 200 || $http >= 300 || !is_array($data)) {
  $msg = is_array($data) && isset($data['error']['message']) ? $data['error']['message'] : 'Chat provider error';
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

json_ok([
  'answer' => $answer,
  'sources' => $sources,
  'referencedItem' => $referencedItem,
  'listedItems' => $listedItems,
]);

