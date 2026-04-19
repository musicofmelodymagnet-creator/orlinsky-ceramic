<?php
require_once __DIR__ . '/../config.php';
session_name(SESSION_NAME);
session_start();
header('Content-Type: application/json');
echo json_encode(['authenticated' => !empty($_SESSION['authenticated'])]);
