<?php
/**
 * GET /api/results.php
 * Retrieves results from MySQL
 */
header('Content-Type: application/json');
require_once __DIR__ . '/db_config.php';

try {
    // Check if a specific registration number is requested
    $regNo = $_GET['reg_no'] ?? null;
    $examId = $_GET['exam_id'] ?? null;

    // Fetch Site Settings (Meta & Signature)
    $meta = [
        'school' => 'Global Excellence Academy',
        'title' => 'Official Statement of Marks',
        'session' => '2025-2026',
        'lang' => 'en',
        'passVal' => 35
    ];
    $signature = null;

    $stmtSettings = $pdo->query("SELECT * FROM site_settings");
    while ($row = $stmtSettings->fetch()) {
        if ($row['key'] === 'meta') $meta = json_decode($row['value'], true);
        if ($row['key'] === 'signature') $signature = json_decode($row['value'], true);
    }

    if ($regNo) {
        $stmt = $pdo->prepare("SELECT data FROM results WHERE reg_no = ?");
        $stmt->execute([$regNo]);
        $row = $stmt->fetch();
        
        if ($row) {
            $studentData = json_decode($row['data'], true);
            echo json_encode([
                'success' => true,
                'data' => $studentData,
                'meta' => $meta,
                'signature' => $signature
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Result not found']);
        }
    } else {
        // Broad search or all results
        $stmt = $pdo->query("SELECT data FROM results LIMIT 1000");
        $rows = $stmt->fetchAll();
        
        $results = array_map(function($row) {
            return json_decode($row['data'], true);
        }, $rows);
        
        echo json_encode([
            'success' => true,
            'meta' => $meta,
            'signature' => $signature,
            'data' => ['exams' => [['results' => $results]]],
            'exams' => [['results' => $results]] // Added for compatibility with different frontend structures
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
exit;
