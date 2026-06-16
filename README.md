# 🏫 UniEvent – University Event & Club Management System

Welcome to the **UniEvent** web portal! UniEvent is a premium, lightweight, interactive, and responsive web-based application designed to bring university students, club organizers, and administrators together under a unified campus hub. 

This platform allows student coordinators and administrators to manage campus events efficiently, while enabling students to discover active clubs, enroll in events, and manage their personal schedules.

---

## 🔗 Documentation Index
To explore specific facets of the project, refer to the following comprehensive guides in the `docs/` directory:

1. **[Project Outline & SRS Analysis](file:///c:/Users/ASUS/workspace/Projects/unievent/docs/project-outline-srs.md)**: Details the target market, problem statement, use case environment, and software requirements (functional, non-functional, and user matrix).
2. **[User & Administration Guide](file:///c:/Users/ASUS/workspace/Projects/unievent/docs/user-guide.md)**: A step-by-step walkthrough of student interactions (joining clubs, event registrations), leader privileges (creating events), and dashboard operations.
3. **[Architecture & Technical Reference](file:///c:/Users/ASUS/workspace/Projects/unievent/docs/architecture-and-technical-guide.md)**: Deep dive into the frontend system architecture, local storage mock database implementation, custom UI components (modals, toast system), scroll reveals, and canvas particle graphics.
4. **[Future Expansion & Migration Plan](file:///c:/Users/ASUS/workspace/Projects/unievent/docs/future-development-plan.md)**: Step-by-step technical blueprints for migrating from the current `localStorage` mock setup to a persistent backend database server (Node.js/Express/SQL or Firebase).

---

## 🚀 Key Features

*   **Premium Visuals & Responsiveness**: Modern glassmorphism UI styled with curated color palettes, elegant gradients, smooth micro-interactions, responsive grids, and full mobile support.
*   **Dynamic Landing Dashboard**: Features count-up statistics counters, interactive marketing sections, and dynamically rendered popular events.
*   **Comprehensive Student Dashboard**:
    *   **Activity Logs**: Real-time relative-timestamped tracking of student activities (e.g., "Joined Coding Club 2h ago").
    *   **Interactive Calendar**: A custom monthly calendar that highlights registered event dates and supports modal inspection of day schedules.
    *   **Actionable Lists**: Tables and lists for cancelling registrations or leaving clubs on the fly.
*   **Search and Filters**: Live keyword searching and category filtering (All, Academic, Cultural, Athletics) for both events and clubs.
*   **Privilege Guards**: Dynamic menu rendering and auth guards preventing standard students from accessing creation forms restricted to club leaders/admins.
*   **Dynamic Visual Elements**: Ambient canvas particle generator background and scroll-reveal triggers.

---

## 🛠️ Technology Stack

1.  **HTML5**: Semantic elements (`<nav>`, `<section>`, `<footer>`), canvas renders.
2.  **CSS3**: Custom HSL/hex variables, CSS Flexbox & Grid layouts, keyframe animations, responsive media queries, and backdrop filtering (glassmorphism).
3.  **JavaScript (ES6+)**: LocalStorage state management, dynamic DOM rendering, custom observer patterns, canvas math, and custom modal/toast APIs.

---

## 📁 Project Directory Structure

```text
unievent/
│
├── css/
│   ├── style.css         # Core stylesheet, variables, layout grids, components
│   ├── animations.css    # Page loaders, orb floats, fades, and scale animations
│   └── dashboard.css     # CSS rules for sidebar, stats, calendar, tables
│
├── js/
│   ├── app.js            # Mock DB (localStorage), toast/modal utilities, particle engine, auth guards
│   ├── events.js         # Event/Club explorer filters, joins, profile editor, event creation controller
│   └── dashboard.js      # Dashboard widgets, relative time formatter, calendar generator, action triggers
│
├── docs/
│   ├── project-outline-srs.md
│   ├── user-guide.md
│   ├── architecture-and-technical-guide.md
│   └── future-development-plan.md
│
├── index.html            # Main landing page
├── login.html            # User login page
├── signup.html           # User signup page
├── dashboard.html        # Main authenticated user dashboard
├── profile.html          # Profile settings, registered events & clubs manager
├── events.html           # Campus events explorer & registration page
├── clubs.html            # Campus clubs directory
├── create-event.html     # Event creation page (restricted to Leader/Admin roles)
└── README.md             # This document
```

---

## 🔑 Demo Access Credentials
UniEvent is populated with a pre-configured local database mock when first run. You can log in using the following accounts:

| Role | Email | Password | Preloaded Info |
| :--- | :--- | :--- | :--- |
| **Student** | `student@unievent.com` | `password123` | **Name:** Alex Mercer<br>**Registered Events:** UniHack 2026<br>**Joined Clubs:** Coding Club, Music & Arts Society |
| **Club Leader** | `leader@unievent.com` | `password123` | **Name:** Dr. Sarah Connor<br>**Authorized Actions:** Create and edit events |
| **Administrator** | `admin@unievent.com` | `password123` | **Name:** Admin User<br>**Authorized Actions:** Full administrative CRUD |

*Note: You can also register a brand new account using the Sign Up page.*

---

## ⚙️ How to Run Locally

Since this is a client-side web application using HTML, CSS, and Vanilla JavaScript, running it is simple:

1.  **Direct Execution**: Open the [index.html](file:///c:/Users/ASUS/workspace/Projects/unievent/index.html) file directly in any modern web browser.
2.  **Local Server (Recommended)**: Use a lightweight web server to ensure modern features (like imports or absolute routing redirects) work correctly:
    *   **VS Code Live Server**: Right-click `index.html` and select *Open with Live Server*.
    *   **Node.js**: Run `npx serve .` or `npx http-server` in the project directory.
    *   **Python**: Run `python -m http.server 8000` in the terminal.
