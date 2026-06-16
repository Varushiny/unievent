# 🚀 Future Development & Backend Migration Plan

This document outlines the step-by-step roadmap for migrating the **UniEvent** client-side prototype to a fully persistent, secure, database-backed web application.

---

## 1. Architectural Transition: Mock vs. Production Backend

The current prototype handles all database operations in the client's browser memory using `localStorage` and static JavaScript scripts. To prepare this application for production, we will transition it to a client-server architecture.

```text
CURRENT FRONTEND-ONLY PROTOTYPE
  ┌───────────────┐     Read/Write JSON     ┌────────────────┐
  │ Browser (DOM) │ ◄─────────────────────► │ localStorage   │
  └───────────────┘                         └────────────────┘

TARGET PRODUCTION CLIENT-SERVER MODEL
  ┌───────────────┐        HTTPS API        ┌────────────────┐      SQL Query      ┌────────────────┐
  │ Browser (DOM) │ ◄─────────────────────► │ Backend Server │ ◄─────────────────► │ Database       │
  └───────────────┘                         │ (PHP / Node)   │                     │ (MySQL / Postg)│
                                            └────────────────┘                     └────────────────┘
```

---

## 2. Option A: PHP + MySQL Migration (Classic SQL Path)

This path aligns with the original "Phase 1" college-level design specifications. It uses standard PHP session management and a relational MySQL database.

### 2.1 Database SQL Schema (MySQL)

We will create a relational schema matching our data models. We will enforce constraints such as cascading deletes to clean up registrations when events are cancelled:

```sql
CREATE DATABASE IF NOT EXISTS unievent_db;
USE unievent_db;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    faculty VARCHAR(100),
    department VARCHAR(100),
    role ENUM('student', 'leader', 'admin') DEFAULT 'student',
    avatar VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clubs Table
CREATE TABLE clubs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    logo VARCHAR(10) NOT NULL, -- Emojis or image paths
    members_base_count INT DEFAULT 0
);

-- 3. Events Table
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    club_id VARCHAR(50),
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    created_by VARCHAR(50),
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Club Memberships Table
CREATE TABLE memberships (
    club_id VARCHAR(50),
    user_id VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (club_id, user_id),
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Event Registrations Table
CREATE TABLE registrations (
    event_id VARCHAR(50),
    user_id VARCHAR(50),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Activities Table
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    type VARCHAR(30) NOT NULL,
    text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2.2 Backend Execution Steps (PHP)
1.  **Database Connection Helper (`db.php`)**: Establish connection using the PHP Data Objects (PDO) extension, setting error modes to exceptions and disabling prepared statement simulation to prevent SQL injection.
2.  **Authentication & Sessions (`auth.php`)**:
    *   **Register API**: Receive POST details, hash passwords using `password_hash($pass, PASSWORD_BCRYPT)`, and run INSERT operations.
    *   **Login API**: Query the database for the user's email, check passwords using `password_verify()`, and initialize server sessions with `session_start()` and `$_SESSION['user_id'] = $user['id']`.
3.  **Restricted API Handlers (`api/`)**:
    *   `api/get_events.php`: Run JOIN queries to fetch events alongside organizing club details. Return the results as JSON.
    *   `api/create_event.php`: Validate the user's session role (`leader` or `admin`). Run INSERT queries to save the event.
    *   `api/register_event.php`: Handle registration status changes by inserting or deleting records from the `registrations` table.

---

## 3. Option B: Firebase Serverless Migration (Modern Cloud Path)

If you prefer a modern, serverless cloud setup without managing server infrastructure, Firebase provides an excellent alternative:

*   **Firebase Authentication**: Replace custom login logic with Firebase Auth SDK to manage logins and session tokens.
*   **Firestore Database**: Store events, clubs, memberships, registrations, and activities inside collections of JSON documents. Firestore's SDK allows you to sync changes to the UI in real-time.
*   **Firebase Hosting**: Deploy the frontend files (HTML/CSS/JS) to Firebase's global CDN.

---

## 4. Client-Side Code Adjustments

To transition the frontend to integrate with backend APIs (e.g., the PHP endpoints described in Option A), update the client-side code as follows:

### 4.1 Refactoring the Database Client Wrapper
We will modify the global `db` wrapper in [app.js](file:///c:/Users/ASUS/workspace/Projects/unievent/js/app.js) to use asynchronous `fetch` requests:

```javascript
// Old client-side mock wrapper
/*
const db = {
  get: (key, defaultVal) => { ... },
  set: (key, value) => { ... }
};
*/

// New Asynchronous API Client Wrapper
const db = {
  getEvents: async () => {
    try {
      const response = await fetch('/api/get_events.php');
      if (!response.ok) throw new Error('Network error');
      return await response.json();
    } catch (error) {
      showToast('Error loading events directory', 'error');
      return [];
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await fetch('/api/get_current_user.php');
      if (response.status === 401) return null;
      return await response.json();
    } catch (e) {
      return null;
    }
  },

  registerForEvent: async (eventId) => {
    try {
      const response = await fetch('/api/register_event.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      const result = await response.json();
      if (result.success) {
        showToast(result.message, 'success');
        return true;
      } else {
        showToast(result.message, 'error');
        return false;
      }
    } catch (error) {
      showToast('Connection failed. Try again.', 'error');
      return false;
    }
  }
};
```

### 4.2 Updating Page Rendering Scripts
We will update our rendering controllers (like `renderEvents` in [events.js](file:///c:/Users/ASUS/workspace/Projects/unievent/js/events.js)) to handle asynchronous data fetching:

```javascript
// Refactoring rendering scripts to handle async data
async function initEventsPage(user) {
  const gridContainer = document.getElementById('events-grid-container');
  
  const renderEvents = async () => {
    // Show spinner loader
    gridContainer.innerHTML = '<div class="spinner"></div>';
    
    // Fetch live data from backend server
    const events = await db.getEvents();
    
    // Filter and render events
    // (Existing rendering and filtering logic remains unchanged)
  };

  renderEvents();
}
```
