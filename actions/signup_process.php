<?php
/**
 * UniEvent - Signup Process
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../signup.html");
    exit;
}

$name = trim($_POST['name'] ?? '');
$student_id = trim($_POST['student_id'] ?? '');
$email = trim($_POST['email'] ?? '');
$faculty = trim($_POST['faculty'] ?? '');
$department = trim($_POST['department'] ?? '');
$password = $_POST['password'] ?? '';
$password_confirm = $_POST['password_confirm'] ?? '';

// Server-side validation
if (empty($name) || empty($student_id) || empty($email) || empty($password)) {
    header("Location: ../signup.html?error=" . urlencode("All fields are required."));
    exit;
}

if ($password !== $password_confirm) {
    header("Location: ../signup.html?error=" . urlencode("Passwords do not match."));
    exit;
}

if (preg_match('/\d/', $name)) {
    header("Location: ../signup.html?error=" . urlencode("Full Name cannot contain numbers."));
    exit;
}

try {
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT student_id FROM students WHERE student_id = ? OR email = ?");
    $stmt->execute([$student_id, $email]);
    if ($stmt->fetch()) {
        header("Location: ../signup.html?error=" . urlencode("Student ID or Email already registered."));
        exit;
    }

    // Insert user
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $role = 'student'; // Default role

    $stmt = $pdo->prepare("INSERT INTO students (student_id, name, email, password_hash, faculty, department, role) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$student_id, $name, $email, $hash, $faculty, $department, $role]);

    // Log the user in automatically
    $_SESSION['student_id'] = $student_id;
    $_SESSION['name'] = $name;
    $_SESSION['email'] = $email;
    $_SESSION['role'] = $role;
    $_SESSION['faculty'] = $faculty;
    $_SESSION['department'] = $department;

    header("Location: ../dashboard.php?success=" . urlencode("Registration successful!"));
    exit;

} catch (\PDOException $e) {
    header("Location: ../signup.html?error=" . urlencode("Database error during registration."));
    exit;
}
