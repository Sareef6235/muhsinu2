<?php
/**
 * POST /api/git_sync.php
 * Attempts to sync changes to GitHub using system git
 */
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

$message = $input['message'] ?? 'Auto-sync from PHP Dashboard';
$branch = $input['branch'] ?? 'main';

// CAUTION: cPanel shared hosting may disable exec() or shell_exec()
if (!function_exists('exec')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'exec() function is disabled on this server. Git sync unavailable.']);
    exit;
}

$cmd = "git add . && git commit -m " . escapeshellarg($message) . " && git push origin " . escapeshellarg($branch);

exec($cmd . " 2>&1", $output, $returnCode);

if ($returnCode !== 0) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Git sync failed',
        'output' => $output
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Git sync completed successfully',
        'output' => $output
    ]);
}
exit;
