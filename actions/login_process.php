<?php
/**
 * UniEvent - Login Process
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../login.html");
    exit;
}

$student_id = trim($_POST['student_id'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($student_id) || empty($password)) {
    header("Location: ../login.html?error=" . urlencode("Student ID and password are required."));
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Create session
        $_SESSION['student_id'] = $user['student_id'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['faculty'] = $user['faculty'];
        $_SESSION['department'] = $user['department'];

        header("Location: ../dashboard.php?success=" . urlencode("Welcome back, " . $user['name'] . "!"));
        exit;
    } else {
        header("Location: ../login.html?error=" . urlencode("Invalid student number or password."));
        exit;
    }
} catch (\PDOException $e) {
    header("Location: ../login.html?error=" . urlencode("Database error during login."));
    exit;
}
