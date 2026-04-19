<?php
// Защита от прямого открытия в браузере
if (count(get_included_files()) === 1) { http_response_code(403); exit; }

define('ADMIN_PASSWORD', 'orlinsky2026');   // ← сменить пароль
define('SESSION_NAME',   'orlinsky_admin');
define('CONTENT_FILE',   __DIR__ . '/content.json');
define('MEDIA_DIR',      __DIR__ . '/media/');
