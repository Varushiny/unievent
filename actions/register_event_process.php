<?php
/**
 * UniEvent - Register For Event Process
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../events.php");
    exit;
}

$event_id = trim($_POST['event_id'] ?? '');

if (empty($event_id)) {
    header("Location: ../events.php?error=" . urlencode("Event ID is required."));
    exit;
}

$student_id = $_SESSION['student_id'];

try {
    // 1. Confirm the event exists and has status = 'approved'
    $stmt = $pdo->prepare("SELECT * FROM event WHERE event_id = ?");
    $stmt->execute([$event_id]);
    $event = $stmt->fetch();

    if (!$event) {
        header("Location: ../events.php?error=" . urlencode("Event not found."));
        exit;
    }

    if ($event['status'] !== 'approved') {
        header("Location: ../events.php?error=" . urlencode("You can only register for approved events."));
        exit;
    }

    // 2. Check whether the current student is already registered
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM registrations WHERE student_id = ? AND event_id = ?");
    $stmt->execute([$student_id, $event_id]);
    $is_registered = $stmt->fetchColumn() > 0;

    if ($is_registered) {
        header("Location: ../events.php?error=" . urlencode("Already registered for this event."));
        exit;
    }

    // 3. Insert registration record
    $stmt = $pdo->prepare("INSERT INTO registrations (student_id, event_id) VALUES (?, ?)");
    $stmt->execute([$student_id, $event_id]);

    header("Location: ../dashboard.php?success=" . urlencode("Successfully registered for " . $event['title'] . "!"));
    exit;

} catch (\PDOException $e) {
    // Handle duplicate constraint or other database errors safely
    if ($e->getCode() == 23000 || $e->getCode() == '23000') { // Integrity constraint violation (e.g. duplicate key)
        header("Location: ../events.php?error=" . urlencode("Already registered for this event."));
    } else {
        header("Location: ../events.php?error=" . urlencode("Database error. Registration failed."));
    }
    exit;
}
