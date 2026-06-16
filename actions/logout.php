<?php
/**
 * UniEvent - Logout Process
 */

require_once __DIR__ . '/../config/session.php';

session_unset();
session_destroy();

// Delete frontend sync cookie
setcookie('student_name', '', time() - 3600, '/');

header("Location: ../login.html?success=" . urlencode("Logged out successfully."));
exit;
