<?php
header('Content-Type: application/json');

$response = [
    'status' => 'Operational',
    'php_version' => PHP_VERSION,
    'time' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
];

echo json_encode($response);
exit;
