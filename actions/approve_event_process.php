<?php
/**
 * UniEvent - Approve Event Process
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

// Require Admin role
requireRole('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../admin_dashboard.php");
    exit;
}

$event_id = trim($_POST['event_id'] ?? '');

if (empty($event_id)) {
    header("Location: ../admin_dashboard.php?error=" . urlencode("Event ID is required."));
    exit;
}

$admin_id = $_SESSION['student_id'];

try {
    $stmt = $pdo->prepare("UPDATE event SET status = 'approved', approved_by = ? WHERE event_id = ?");
    $stmt->execute([$admin_id, $event_id]);

    header("Location: ../admin_dashboard.php?success=" . urlencode("Event approved successfully!"));
    exit;
} catch (\PDOException $e) {
    header("Location: ../admin_dashboard.php?error=" . urlencode("Database error. Could not approve event."));
    exit;
}
