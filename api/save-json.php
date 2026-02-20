<?php
/**
 * POST /api/save-json.php
 * Saves JSON data to the site_settings table
 */
header('Content-Type: application/json');
require_once __DIR__ . '/db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Determine key (e.g., meta, signature, or a filename-based key)
    $key = $_GET['key'] ?? 'generic_json';

    $stmt = $pdo->prepare("INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
    $stmt->execute([$key, $rawInput, $rawInput]);

    echo json_encode([
        'success' => true,
        'message' => "Source '{$key}' Updated in MySQL."
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
exit;
