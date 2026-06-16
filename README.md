# UniEvent - University Event Management System

This is a Web Development course project demonstrating a standard PHP + MySQL traditional web application. It follows a strict separation of frontend presentation (HTML/CSS/JS) and backend logic (PHP). 

## Project Structure

- **`/` (Root)**: Contains all presentation files.
  - HTML templates (`index.html`, `login.html`, `signup.html`, `create-event.html`)
  - PHP templates (`events.php`, `dashboard.php`) for pages requiring dynamic loops.
  - CSS stylesheets and JavaScript files (used strictly for UI interactions and validation).
- **`/actions/`**: PHP scripts that process `$_POST` form submissions, handle database interactions, and perform HTTP redirects.
- **`/config/`**: Database connection (`db.php`) and session setup (`session.php`).
- **`/database/`**: Contains the SQL schema for MySQL (`unievent_db.sql`).

## Features
- **Student Authentication**: Secure signup and login using PHP `$_SESSION` and `password_hash()`.
- **Event Management**: Students can submit event requests. Admins can review and approve or reject them.
- **Event Registration**: Students can register for approved events and cancel their registration from their dashboard.
- **Strict Validation**: Client-side (JavaScript) validation ensures data integrity before submission, backed by server-side checks.

## Setup Instructions
1. Move the `unievent` folder to your XAMPP `htdocs` directory.
2. Start Apache and MySQL via the XAMPP Control Panel.
3. Open `phpMyAdmin` (http://localhost/phpmyadmin) and import `database/unievent_db.sql`.
4. Access the project at `http://localhost/unievent/`.
