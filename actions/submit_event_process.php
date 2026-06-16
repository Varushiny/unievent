<?php
/**
 * UniEvent - Submit Event Process
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../create-event.html");
    exit;
}

$title = trim($_POST['title'] ?? '');
$category = trim($_POST['category'] ?? '');
$date = trim($_POST['date'] ?? '');
$time = trim($_POST['time'] ?? '');
$venue = trim($_POST['venue'] ?? '');
$description = trim($_POST['description'] ?? '');

if (empty($title) || empty($category) || empty($date) || empty($time) || empty($venue) || empty($description)) {
    header("Location: ../create-event.html?error=" . urlencode("All fields are required."));
    exit;
}

$created_by = $_SESSION['student_id'];
$status = 'pending';
$club_name = 'Independent'; // Defaulting for now as per plan
$image_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'; // Default demo image

try {
    $stmt = $pdo->prepare("INSERT INTO event (title, description, event_date, event_time, location, category, club_name, created_by, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $title, 
        $description, 
        $date, 
        $time, 
        $venue, 
        $category, 
        $club_name, 
        $created_by, 
        $status, 
        $image_url
    ]);

    header("Location: ../dashboard.php?success=" . urlencode("Event submitted for approval!"));
    exit;

} catch (\PDOException $e) {
    header("Location: ../create-event.html?error=" . urlencode("Database error. Could not submit event."));
    exit;
}
