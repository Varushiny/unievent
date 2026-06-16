<?php
/**
 * UniEvent - Reject Event Process
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

try {
    $stmt = $pdo->prepare("UPDATE event SET status = 'rejected' WHERE event_id = ?");
    $stmt->execute([$event_id]);

    header("Location: ../admin_dashboard.php?success=" . urlencode("Event rejected successfully!"));
    exit;
} catch (\PDOException $e) {
    header("Location: ../admin_dashboard.php?error=" . urlencode("Database error. Could not reject event."));
    exit;
}
