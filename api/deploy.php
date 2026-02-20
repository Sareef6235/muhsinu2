<?php
/**
 * POST /api/deploy.php
 * Receives JSON results and syncs to MySQL
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

    // Extract results (match Node.js logic)
    $results = $input['results'] ?? (isset($input['exams'][0]['results']) ? $input['exams'][0]['results'] : null);
    
    if (!$results || !is_array($results)) {
        if (is_array($input) && !isset($input['results'])) {
             $results = $input; // Fallback if input itself is the array
        } else {
            throw new Exception('Results array missing or invalid');
        }
    }

    $pdo->beginTransaction();

    // Matching Sync behavior: clear old and insert new
    // WARNING: For high-traffic sites, consider a more surgical update/upsert approach.
    $pdo->exec("DELETE FROM results");

    $stmt = $pdo->prepare("INSERT INTO results (reg_no, exam_id, full_name, total_marks, status, data) VALUES (?, ?, ?, ?, ?, ?)");

    foreach ($results as $res) {
        $regNo = $res['regNo'] ?? $res['reg_no'] ?? 'N/A';
        $examId = $res['examId'] ?? $res['exam_id'] ?? 'default';
        $fullName = $res['name'] ?? $res['fullName'] ?? 'Unknown';
        $totalMarks = $res['total'] ?? $res['total_marks'] ?? 0;
        $status = $res['status'] ?? 'N/A';
        
        $jsonData = json_encode($res);

        $stmt->execute([$regNo, $examId, $fullName, $totalMarks, $status, $jsonData]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Cloud Sync Successful (PHP/MySQL)',
        'count' => count($results)
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
exit;
