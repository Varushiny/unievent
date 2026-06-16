<?php
/**
 * UniEvent - Session Management Helper
 * Starts PHP sessions securely and provides auth guards for APIs.
 */

if (session_status() === PHP_SESSION_NONE) {
    // Set session cookie parameters for security
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    
    session_start();
}

/**
 * Checks if a user is currently logged in.
 *
 * @return bool
 */
function isLoggedIn() {
    return isset($_SESSION['student_id']);
}

/**
 * Returns the currently logged-in user's details.
 *
 * @return array|null
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    return [
        'id' => $_SESSION['student_id'], // Map student_id to 'id' to match frontend expected key
        'studentId' => $_SESSION['student_id'],
        'name' => $_SESSION['name'],
        'email' => $_SESSION['email'],
        'role' => $_SESSION['role'],
        'faculty' => $_SESSION['faculty'] ?? null,
        'department' => $_SESSION['department'] ?? null,
        'avatar' => $_SESSION['avatar'] ?? ''
    ];
}

/**
 * Restricts access to authenticated users only.
 */
function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: ../login.html?error=" . urlencode("Unauthorized. Please log in."));
        exit();
    }
}

/**
 * Restricts access to specific roles.
 *
 * @param array|string $allowedRoles Single role string or array of allowed roles
 */
function requireRole($allowedRoles) {
    requireLogin();
    
    $roles = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];
    $userRole = $_SESSION['role'] ?? '';
    
    if (!in_array($userRole, $roles)) {
        header("Location: ../dashboard.php?error=" . urlencode("Forbidden. You do not have permission."));
        exit();
    }
}
