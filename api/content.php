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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists(CONTENT_FILE)) {
        echo file_get_contents(CONTENT_FILE);
    } else {
        echo json_encode(['ru' => [], 'en' => [], 'uk' => [], 'reviews' => [], 'media' => []]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    if (json_decode($raw) === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    file_put_contents(CONTENT_FILE, $raw);
    echo json_encode(['ok' => true]);
}
