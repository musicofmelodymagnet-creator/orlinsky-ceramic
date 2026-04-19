<?php
require_once __DIR__ . '/../config.php';
session_name(SESSION_NAME);
session_start();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$password = $data['password'] ?? '';

if ($password === ADMIN_PASSWORD) {
    session_regenerate_id(true);
    $_SESSION['authenticated'] = true;
    echo json_encode(['ok' => true]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Неверный пароль']);
}
