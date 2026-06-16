<?php
require_once 'config/session.php';
require_once 'config/db.php';
requireLogin();

$student_id = $_SESSION['student_id'];

// 1. Fetch registered events
try {
    $stmt = $pdo->prepare("
        SELECT e.* FROM event e 
        JOIN registrations r ON e.event_id = r.event_id 
        WHERE r.student_id = ? 
        ORDER BY e.date ASC
    ");
    $stmt->execute([$student_id]);
    $my_events = $stmt->fetchAll();
} catch (\PDOException $e) {
    $my_events = [];
}

// 2. Fetch submitted events and their approval status
try {
    $stmt = $pdo->prepare("
        SELECT * FROM event 
        WHERE created_by = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$student_id]);
    $my_submitted_events = $stmt->fetchAll();
} catch (\PDOException $e) {
    $my_submitted_events = [];
}

// 3. Stats calculations
$registered_count = count($my_events);
$upcoming_registered_count = 0;
$today = date('Y-m-d');
foreach ($my_events as $evt) {
    if ($evt['status'] === 'approved' && $evt['date'] >= $today) {
        $upcoming_registered_count++;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Dashboard - UniEvent</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/dashboard.css">
</head>
<body>

  <div class="dashboard-layout">
    
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-logo">🏫 Uni<span>Event</span></a>
      </div>
      
      <div class="sidebar-user">
        <div class="user-avatar">
          <!-- Initial letter injected via JS -->
        </div>
        <div class="user-info">
          <span class="user-name">Loading...</span>
          <span class="user-role">Student</span>
        </div>
      </div>

      <ul class="sidebar-nav">
        <li class="sidebar-item active">
          <a href="dashboard.php">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            Dashboard
          </a>
        </li>


        <li class="sidebar-item" id="create-event-sidebar-item">
          <a href="create-event.html">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Create Event
          </a>
        </li>
        <?php if ($_SESSION['role'] === 'admin'): ?>
        <li class="sidebar-item">
          <a href="admin_dashboard.php">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Admin Dashboard
          </a>
        </li>
        <?php endif; ?>
        <li class="sidebar-item">
          <a href="profile.html">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </a>
        </li>
      </ul>

      <div class="sidebar-footer">
        <a href="#" id="sidebar-logout" style="display:flex; align-items:center; gap:12px; font-size:0.9rem; font-weight:500;">
          <svg viewBox="0 0 24 24" style="width:18px; height:18px; stroke:currentColor; stroke-width:2; fill:none; flex-shrink:0;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Log Out
        </a>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      
      <!-- Top header bar -->
      <header class="main-header">
        <div style="display:flex; align-items:center; gap: 16px;">
          <button class="mobile-sidebar-toggle" aria-label="Toggle sidebar">☰</button>
          <div class="page-title">
            <h2 id="dashboard-welcome-heading">Welcome back!</h2>
            <p>Manage your campus schedules and event notifications</p>
          </div>
        </div>

        <div class="header-controls">
          <div class="notifications-bell" id="bell-icon">
             <span class="bell-badge pulse-badge"></span>
          </div>
          <a href="profile.html" class="user-avatar" style="width: 40px; height: 40px; cursor: pointer;">
            <!-- Initial letter -->
          </a>
        </div>
      </header>

      <!-- Statistics Row -->
      <section class="stats-row">
        <div class="stat-card">
          <div class="stat-details">
            <span class="stat-number" id="stat-regs-count"><?php echo $registered_count; ?></span>
            <span class="stat-label">Registered Events</span>
          </div>
         
        </div>



        <div class="stat-card">
          <div class="stat-details">
            <span class="stat-number" id="stat-upcoming-count"><?php echo $upcoming_registered_count; ?></span>
            <span class="stat-label">Upcoming Activities</span>
          </div>
          
        </div>
      </section>

      <!-- Dashboard Grid (2col layout: Left = Events, Right = Activities & Calendar) -->
      <div class="dashboard-grid">
        
        <!-- Left: Registered Events -->
        <div>
          <div class="section-header">
            <h3>My Registered Events</h3>
            <a href="index.html" class="section-link">Explore More &rarr;</a>
          </div>

          <!-- Empty State -->
          <div id="dashboard-events-empty-state" class="glass-card" style="text-align: center; padding: 48px; display: none;">
  
            <h4>No Event Registrations</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px; margin-bottom: 24px;">Browse upcoming events to sign up and join lists.</p>
            <a href="index.html" class="btn btn-primary" style="padding: 8px 20px; font-size: 0.85rem;">Browse Events</a>
          </div>

          <!-- Events Table -->
          <div class="responsive-table-container">
            <table class="responsive-table">
              <thead>
                <tr>
                  <th>Event details</th>
                  <th>Schedule</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="dashboard-events-table-body">
                <?php if (empty($my_events)): ?>
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 48px; color: var(--text-muted);">
                      <h4>No Event Registrations</h4>
                      <p style="font-size: 0.9rem; margin-top: 8px;">Browse upcoming events to sign up and join lists.</p>
                    </td>
                  </tr>
                <?php else: ?>
                  <?php foreach ($my_events as $evt): ?>
                    <?php
                      $isPast = strtotime($evt['date']) < strtotime(date('Y-m-d'));
                      $statusText = $isPast ? 'Completed' : 'Upcoming';
                      $badgeClass = $isPast ? 'badge-danger' : 'badge-success';
                    ?>
                    <tr>
                      <td>
                        <div style="font-weight: 600; color: var(--text-color);"><?php echo htmlspecialchars($evt['title']); ?></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);"><?php echo htmlspecialchars($evt['club_name']); ?></div>
                      </td>
                      <td>
                        📅 <?php echo date('M j, Y', strtotime($evt['date'])); ?><br>
                        ⏰ <?php echo date('H:i', strtotime($evt['time'])); ?>
                      </td>
                      <td>📍 <?php echo htmlspecialchars($evt['location']); ?></td>
                      <td><span class="status-badge <?php echo $badgeClass; ?>"><?php echo $statusText; ?></span></td>
                      <td>
                        <form action="actions/cancel_registration_process.php" method="POST" style="margin: 0;">
                          <input type="hidden" name="event_id" value="<?php echo htmlspecialchars($evt['event_id']); ?>">
                          <button type="submit" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm);">
                            Cancel
                          </button>
                        </form>
                      </td>
                    </tr>
                  <?php endforeach; ?>
                <?php endif; ?>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Submitted Events Queue -->
        <div style="margin-top: 40px;">
          <div class="section-header">
            <h3>My Submitted Events</h3>
          </div>

          <div class="responsive-table-container">
            <table class="responsive-table">
              <thead>
                <tr>
                  <th>Event Details</th>
                  <th>Schedule</th>
                  <th>Venue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <?php if (empty($my_submitted_events)): ?>
                  <tr>
                    <td colspan="4" style="text-align: center; padding: 24px; color: var(--text-muted);">
                      You have not submitted any event requests.
                    </td>
                  </tr>
                <?php else: ?>
                  <?php foreach ($my_submitted_events as $evt): ?>
                    <?php
                      $status = $evt['status'];
                      $badgeClass = '';
                      if ($status === 'approved') {
                          $badgeClass = 'badge-success';
                      } elseif ($status === 'rejected') {
                          $badgeClass = 'badge-danger';
                      } else {
                          $badgeClass = 'badge-warning';
                      }
                    ?>
                    <tr>
                      <td>
                        <div style="font-weight: 600; color: var(--text-color);"><?php echo htmlspecialchars($evt['title']); ?></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);"><?php echo htmlspecialchars($evt['category']); ?></div>
                      </td>
                      <td>
                        📅 <?php echo date('M j, Y', strtotime($evt['date'])); ?><br>
                        ⏰ <?php echo date('H:i', strtotime($evt['time'])); ?>
                      </td>
                      <td>📍 <?php echo htmlspecialchars($evt['location']); ?></td>
                      <td><span class="status-badge <?php echo $badgeClass; ?>"><?php echo htmlspecialchars(ucfirst($status)); ?></span></td>
                    </tr>
                  <?php endforeach; ?>
                <?php endif; ?>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </main>

  </div>

  <!-- Scripts -->
  <script>
    window.currentUser = <?php echo json_encode(getCurrentUser()); ?>;
    window.myEvents = <?php echo json_encode($my_events); ?>;
  </script>
  <script src="js/app.js"></script>
  <script src="js/dashboard.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const user = db.getCurrentUser();
      if (user) {
        // Welcome heading custom text
        const welcomeEl = document.getElementById('dashboard-welcome-heading');
        if (welcomeEl) welcomeEl.textContent = `Welcome back, ${user.name}!`;

        // Everyone can see the create event navigation menu item now, no need to toggle display programmatically

        // Notification Bell handler
        const bell = document.getElementById('bell-icon');
        bell.addEventListener('click', () => {
          modalHelper.create('System Alerts', `
            <div style="font-family: var(--font-main);">
              <div style="margin-bottom: 12px; padding: 12px; border-radius: var(--radius-sm); background: #F8FAFC; border-left:4px solid var(--success-color);">
                <div style="font-weight:600; font-size:0.9rem;">Hackathon registration success</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top:4px;">Registered for UniHack 2026. Make sure to download templates.</div>
              </div>
              <div style="margin-bottom: 12px; padding: 12px; border-radius: var(--radius-sm); background: #F8FAFC; border-left:4px solid var(--accent-color);">
                <div style="font-weight:600; font-size:0.9rem;">Join alert</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top:4px;">You have joined Coding Club successfully. Check your channels.</div>
              </div>
            </div>
          `);
        });

        // Logout listener
        document.getElementById('sidebar-logout').addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = 'actions/logout.php';
        });
      }
    });
  </script>
</body>
</html>


