<?php
require_once __DIR__ . '/../config.php';
session_name(SESSION_NAME);
session_start();
header('Content-Type: application/json');

if (empty($_SESSION['authenticated'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'];
$files   = [];

if (is_dir(MEDIA_DIR)) {
    foreach (scandir(MEDIA_DIR) as $f) {
        if ($f === '.' || $f === '..') continue;
        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed)) continue;
        $full    = MEDIA_DIR . $f;
        $files[] = ['name' => $f, 'path' => 'media/' . $f, 'size' => filesize($full), 'mtime' => filemtime($full)];
    }
    usort($files, fn($a, $b) => $b['mtime'] - $a['mtime']);
}

echo json_encode($files);
