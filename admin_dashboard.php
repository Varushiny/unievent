<?php
require_once 'config/session.php';
require_once 'config/db.php';

// Require Admin role
requireRole('admin');

// Fetch pending events with student names who submitted them
try {
    $stmt = $pdo->prepare("
        SELECT e.*, s.name as submitter_name 
        FROM event e 
        LEFT JOIN students s ON e.created_by = s.student_id 
        WHERE e.status = 'pending' 
        ORDER BY e.created_at DESC
    ");
    $stmt->execute();
    $pending_events = $stmt->fetchAll();
} catch (\PDOException $e) {
    $pending_events = [];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - UniEvent</title>
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
          <?php echo htmlspecialchars(substr($_SESSION['name'], 0, 1)); ?>
        </div>
        <div class="user-info">
          <span class="user-name"><?php echo htmlspecialchars($_SESSION['name']); ?></span>
          <span class="user-role">Administrator</span>
        </div>
      </div>

      <ul class="sidebar-nav">
        <li class="sidebar-item">
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
        <li class="sidebar-item active">
          <a href="admin_dashboard.php">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Admin Dashboard
          </a>
        </li>
      </ul>

      <div class="sidebar-footer">
        <a href="#" id="sidebar-logout" style="display:flex; align-items:center; gap:12px; font-weight:500; font-size:0.9rem;">
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
            <h2>Admin Approval Dashboard</h2>
            <p>Review and approve or reject campus event requests</p>
          </div>
        </div>
      </header>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid" style="grid-template-columns: 1fr;">
        
        <!-- Pending Event Requests -->
        <div>
          <div class="section-header">
            <h3>Pending Event Requests</h3>
          </div>

          <!-- Table Container -->
          <div class="responsive-table-container">
            <table class="responsive-table">
              <thead>
                <tr>
                  <th>Event Details</th>
                  <th>Schedule</th>
                  <th>Venue</th>
                  <th>Submitted By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <?php if (empty($pending_events)): ?>
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 48px; color: var(--text-muted);">
                      No pending event requests found.
                    </td>
                  </tr>
                <?php else: ?>
                  <?php foreach ($pending_events as $evt): ?>
                    <tr>
                      <td>
                        <div style="font-weight: 600; color: var(--text-color);"><?php echo htmlspecialchars($evt['title']); ?></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);"><?php echo htmlspecialchars($evt['category']); ?></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;"><?php echo htmlspecialchars($evt['description']); ?></div>
                      </td>
                      <td>
                        📅 <?php echo date('M j, Y', strtotime($evt['date'])); ?><br>
                        ⏰ <?php echo date('H:i', strtotime($evt['time'])); ?>
                      </td>
                      <td>📍 <?php echo htmlspecialchars($evt['location']); ?></td>
                      <td>👤 <?php echo htmlspecialchars($evt['submitter_name'] ?? $evt['created_by']); ?></td>
                      <td>
                        <div style="display: flex; gap: 8px;">
                          <form action="actions/approve_event_process.php" method="POST" style="margin: 0;">
                            <input type="hidden" name="event_id" value="<?php echo htmlspecialchars($evt['event_id']); ?>">
                            <button type="submit" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm);">
                              Approve
                            </button>
                          </form>
                          <form action="actions/reject_event_process.php" method="POST" style="margin: 0;">
                            <input type="hidden" name="event_id" value="<?php echo htmlspecialchars($evt['event_id']); ?>">
                            <button type="submit" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm); border-color: var(--danger-color); color: var(--danger-color);">
                              Reject
                            </button>
                          </form>
                        </div>
                      </td>
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
  <script src="js/app.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Mobile sidebar toggle
      const toggleBtn = document.querySelector('.mobile-sidebar-toggle');
      const sidebar = document.querySelector('.sidebar');
      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          sidebar.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
          if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
            sidebar.classList.remove('active');
          }
        });
      }

      // Logout handler
      document.getElementById('sidebar-logout').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'actions/logout.php';
      });
    });
  </script>
</body>
</html>
