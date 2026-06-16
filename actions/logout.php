<?php
/**
 * UniEvent - Logout Process
 */

require_once __DIR__ . '/../config/session.php';

session_unset();
session_destroy();

header("Location: ../login.html?success=" . urlencode("Logged out successfully."));
exit;
