# 📖 User & Administration Guide

This user guide walks you through the features and operations of the **UniEvent** web portal. It outlines how different users can interact with the system, browse directories, register for activities, join clubs, track schedules, and create events.

---

## 1. Navigating as a Visitor (Unauthenticated)

When you first open UniEvent, you enter as a visitor. As a visitor, you can:
*   Explore the home landing page, review platform stats, and check core features.
*   Browse the public **Events Directory** and **Clubs Directory** (though registration and joining require an account).
*   Create a new account on the **Sign Up Page** or log in to an existing account on the **Login Page**.

---

## 2. Student Workflows

### 2.1 Registration & Authentication
1.  **Register a New Account**: Go to `signup.html` (click **Sign Up** on the navbar). Fill in your name, student ID, email, password, faculty, department, and select the **Student** role.
2.  **Log In**: Navigate to `login.html`, type your credentials, and click **Sign In**.
3.  **Log Out**: Click your profile dropdown at the top right of the navigation bar and select **Logout** (or click the mobile sidebar menu logout button).

### 2.2 Exploring and Registering for Events
*   **Access the Directory**: Go to `events.html` (click **Events** in the navbar).
*   **Search**: Type keywords into the Search Bar. It checks titles, organizing clubs, and venues.
*   **Filter by Category**: Click the filter buttons (All, Academic, Cultural, Athletics) to filter events dynamically.
*   **Filter by Date**: Select a specific calendar date in the date picker input to see events scheduled on that day.
*   **View Event Details**: Click the title of any event card. A details modal will pop up displaying the complete description, schedule, and venue.
*   **Register/Cancel Registration**: Click the **Register Now** button on any event card (or inside the details modal). The button will change to a green **✓ Registered** badge. To cancel, click the button again.

### 2.3 Joining and Leaving Clubs
*   **Access the Directory**: Go to `clubs.html` (click **Clubs** in the navbar).
*   **Browse & Join**: Browse campus clubs, view their total member count, and click **Join Club** to enroll. The system will update the member count and record the action.
*   **Leave a Club**: Click the button again (now labelled **Leave Club**) to withdraw your membership.

### 2.4 Using Your Dashboard
The **Dashboard** (`dashboard.html`) is your personal student control center:
1.  **Statistics Cards**: View quick indicators of your total registered events, joined clubs, and upcoming campus activities.
2.  **Recent Activities Feed**: View a chronological history of your recent actions (e.g. "Joined Coding Club", "Registered for UniHack 2026") formatted with relative timestamps (e.g., *2 hours ago*).
3.  **Upcoming Events Table**: Lists your enrolled activities with date, time, venue, and status indicators. You can cancel any registration directly from this table by clicking **Cancel**.
4.  **Interactive Calendar Widget**: Highlights days on which you have registered events. Click on any highlighted day to open a modal showing your schedule for that day.

### 2.5 Profile Settings
Go to `profile.html` (click the dropdown in the navbar and select **Profile**):
*   **Edit Profile Details**: Update your name, email, faculty, and department. Click **Save Changes** to save.
*   **Manage Enrolled Directories**: Below the form, view dedicated lists of your registered events and joined clubs. Use the inline **Cancel** and **Leave Club** buttons to make changes.

---

## 3. Club Leader & Administrator Workflows

Club Leaders and Administrators have additional privileges to manage campus activities.

### 3.1 Event Creation
1.  Log in as a **Club Leader** (`leader@unievent.com`) or **Administrator** (`admin@unievent.com`).
2.  Navigate to the **Create Event** page (`create-event.html`).
3.  Fill in the event form:
    *   **Event Title**: The main headline for your event.
    *   **Organizing Club**: Select which campus club is hosting the event (this dropdown is populated automatically from the clubs database).
    *   **Date & Time**: When the event takes place.
    *   **Venue**: Where the event is hosted.
    *   **Category**: Academic, Cultural, or Athletics.
    *   **Description**: Detailed information for attendees.
4.  Submit the form. The system will:
    *   Automatically assign a visual placeholder poster.
    *   Save the event details to local storage.
    *   Add a creation event log to your dashboard.
    *   Redirect you to `events.html` where your new event will be visible to all campus users.

---

## 4. Troubleshooting and Tips

> [!NOTE]
> **Data Persistence Notice**  
> Since UniEvent stores all information in your browser's local storage (`localStorage`), clearing your browser history, cache, or site data will reset the database to its default state.

> [!TIP]
> **Testing Roles Quickly**  
> You can test all capabilities without registering new accounts by using the default accounts:
> *   `student@unievent.com` (Alex Mercer)
> *   `leader@unievent.com` (Dr. Sarah Connor)
> *   `admin@unievent.com` (Admin User)
>
> All accounts use the password: **`password123`**
