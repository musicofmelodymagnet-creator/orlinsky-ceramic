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

if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Файл не получен']);
    exit;
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Ошибка загрузки файла (код ' . $file['error'] . ')']);
    exit;
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'];
if (!in_array($ext, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Недопустимый тип файла']);
    exit;
}

if (!is_dir(MEDIA_DIR)) mkdir(MEDIA_DIR, 0755, true);

$base     = preg_replace('/[^\w\-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
$base     = substr($base, 0, 40);
$filename = $base . '_' . time() . '.' . $ext;
$dest     = MEDIA_DIR . $filename;

if (move_uploaded_file($file['tmp_name'], $dest)) {
    echo json_encode(['path' => 'media/' . $filename]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Не удалось сохранить файл. Проверьте права папки media/']);
}
