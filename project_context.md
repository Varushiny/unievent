# UniEvent - Project Context Document

This document provides a comprehensive overview of the **UniEvent** web application. It is designed to be fed into external LLMs or Chat models to quickly understand the project's architecture, database schema, current state, and coding constraints.

---

## 1. Project Overview & Architecture

UniEvent is a **University Event Management System** built as a standard college-level Web Development course project. 

**Tech Stack:**
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** PHP (Vanilla, no frameworks)
- **Database:** MySQL (using PHP PDO)
- **Environment:** XAMPP (`htdocs`)

**Core Architectural Rules:**
1. **No REST APIs / No `fetch()`:** The project relies on traditional server-side rendering and standard form submissions.
2. **Form Handling:** HTML forms submit data directly via `POST` to backend PHP scripts located in the `actions/` directory (e.g., `action="actions/login_process.php"`).
3. **Redirections:** PHP scripts process data and perform HTTP redirects (`header("Location: ...")`). 
4. **Error Handling:** If a PHP script encounters an error, it redirects back to the HTML page with a URL parameter (e.g., `?error=Invalid_Credentials`). Vanilla JavaScript on the frontend reads this parameter and displays a toast/alert.
5. **Session Management:** Standard PHP `$_SESSION` is used to maintain authentication state.
6. **Separation of Concerns:** Files are kept simple. Presentation files (HTML/PHP templates) reside in the root directory. Backend logic resides in `actions/`.

---

## 2. Directory Structure

```text
unievent/
├── index.html            (Landing page)
├── login.html            (Student login form)
├── signup.html           (Student registration form)
├── create-event.html     (Form to submit a new event request)
├── events.php            (Displays all approved events natively via PHP)
├── dashboard.php         (Student portal to view registered/submitted events)
├── actions/              (Backend form processors)
│   ├── login_process.php
│   ├── signup_process.php
│   ├── logout.php
│   ├── submit_event_process.php       * (Pending)
│   ├── approve_event_process.php      * (Pending)
│   ├── reject_event_process.php       * (Pending)
│   ├── register_event_process.php     * (Pending)
│   └── cancel_registration_process.php * (Pending)
├── config/
│   ├── db.php            (PDO MySQL connection)
│   └── session.php       (Session start and auth guard functions)
├── css/                  (Stylesheet assets)
├── js/                   (Client-side validation & UI interactions only)
│   └── app.js            (Toast notifications, URL parameter error handling)
└── database/
    └── unievent_db.sql   (Database schema dump)
```

---

## 3. Database Schema Overview

The database (`unievent_db`) primarily relies on three core tables:

### `students` (Users)
- `student_id` (VARCHAR PK)
- `name` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `role` (ENUM: 'student', 'leader', 'admin')

### `event`
- `event_id` (INT PK AUTO_INCREMENT)
- `title` (VARCHAR)
- `description` (TEXT)
- `event_date` (DATE)
- `event_time` (TIME)
- `location` (VARCHAR)
- `category` (VARCHAR)
- `created_by` (VARCHAR FK -> students.student_id) - *The student who submitted it*
- `approved_by` (VARCHAR FK -> students.student_id) - *The admin who approved it*
- `status` (ENUM: 'pending', 'approved', 'rejected') Default 'pending'

### `event_registration`
- `registration_id` (INT PK)
- `student_id` (VARCHAR FK -> students)
- `event_id` (INT FK -> event)
- `registered_at` (TIMESTAMP)

---

## 4. Current Implementation State

We are currently **mid-way through a refactoring process**. The project was originally a JavaScript single-page application mockup and is being converted to a real PHP/MySQL app.

### ✅ Completed So Far
1. **Database Setup:** Created the DB schema and added `approved_by` and `status` columns to support an approval workflow.
2. **Authentication:** 
   - Converted `login.html` and `signup.html` to use `POST`.
   - Created `actions/login_process.php` and `actions/signup_process.php`.
   - Setup `config/session.php` to handle secure session access (`requireLogin()`).
3. **Events Page:** 
   - Converted `events.html` to `events.php`.
   - Replaced JavaScript rendering with a native PHP `foreach` loop querying `SELECT * FROM event WHERE status = 'approved'`.

### ⏳ Remaining Work (To Be Done)
1. **Admin Approval Workflow:** 
   - Create `admin_dashboard.php` to list `pending` events.
   - Implement `approve_event_process.php` and `reject_event_process.php`.
2. **Event Submission:**
   - Hook up `create-event.html` to `submit_event_process.php`.
3. **Event Registration:**
   - Implement `register_event_process.php` and `cancel_registration_process.php` to insert/delete rows in `event_registration`.
4. **Student Dashboard:**
   - Update `dashboard.php` to fetch and render the events the logged-in student has registered for natively using PHP.

---

## 5. Instructions for External Models
When assisting with this codebase, ensure you:
1. **Never suggest REST APIs, JSON responses, or `fetch()`/AJAX.**
2. Assume the environment is a simple XAMPP `htdocs` setup.
3. Write standard PHP `PDO` statements.
4. If building new features, create HTML templates in the root, and PHP processor scripts in the `actions/` folder. Use `header("Location: ...")` for navigation.
