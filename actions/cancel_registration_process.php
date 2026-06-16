<?php
/**
 * UniEvent - Cancel Registration Process
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../dashboard.php");
    exit;
}

$event_id = trim($_POST['event_id'] ?? '');

if (empty($event_id)) {
    header("Location: ../dashboard.php?error=" . urlencode("Event ID is required."));
    exit;
}

$student_id = $_SESSION['student_id'];

try {
    // 1. Confirm registration exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM registrations WHERE student_id = ? AND event_id = ?");
    $stmt->execute([$student_id, $event_id]);
    $exists = $stmt->fetchColumn() > 0;

    if (!$exists) {
        header("Location: ../dashboard.php?error=" . urlencode("Registration record not found."));
        exit;
    }

    // 2. Delete registration
    $stmt = $pdo->prepare("DELETE FROM registrations WHERE student_id = ? AND event_id = ?");
    $stmt->execute([$student_id, $event_id]);

    header("Location: ../dashboard.php?success=" . urlencode("Registration cancelled successfully."));
    exit;

} catch (\PDOException $e) {
    header("Location: ../dashboard.php?error=" . urlencode("Database error. Could not cancel registration."));
    exit;
}
