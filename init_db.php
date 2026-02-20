<?php
/**
 * Utility to initialize the database
 * Run this once after setting up the MySQL schema
 */
require_once __DIR__ . '/api/db_config.php';

try {
    // Initial Meta
    $meta = [
        'school' => 'Global Excellence Academy',
        'title' => 'Official Statement of Marks',
        'session' => '2025-2026',
        'lang' => 'en',
        'passVal' => 35
    ];

    $stmt = $pdo->prepare("INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
    $stmt->execute(['meta', json_encode($meta), json_encode($meta)]);

    echo "✅ Database initialized with default metadata.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
