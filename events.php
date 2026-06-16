<?php
require_once 'config/session.php';
require_once 'config/db.php';

// Fetch approved events
$stmt = $pdo->prepare("SELECT * FROM event WHERE status = 'approved' ORDER BY date ASC");
$stmt->execute();
$events = $stmt->fetchAll();

// Fetch user's registered events if logged in
$registeredEventIds = [];
if (isLoggedIn()) {
    $stmt = $pdo->prepare("SELECT event_id FROM registrations WHERE student_id = ?");
    $stmt->execute([$_SESSION['student_id']]);
    $registeredEventIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Events Directory - UniEvent</title>
  <link rel="stylesheet" href="css/style.css">
  <style>
    /* Custom Styling for Search & Filter Section */
    .filter-section {
      background: var(--white);
      border-radius: var(--radius-md);
      padding: 24px;
      box-shadow: var(--card-shadow);
      border: 1px solid rgba(226, 232, 240, 0.8);
      margin-bottom: 40px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .filter-tags-container {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-tag {
      padding: 8px 20px;
      border-radius: 50px;
      background: #F1F5F9;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .filter-tag:hover, .filter-tag.active {
      background: var(--primary-gradient);
      color: var(--white);
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.15);
    }

    .search-row {
      display: grid;
      grid-template-columns: 1fr 240px;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .search-row {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- Sticky Navbar -->
  <nav class="navbar" id="main-navbar">
    <div class="nav-container">
      <a href="index.html" class="logo">
        🏫 Uni<span>Event</span>
      </a>
      
      <ul class="nav-links">
        <li class="nav-item"><a href="index.html">Home</a></li>
        <li class="nav-item active"><a href="events.php">Events</a></li>
        <?php if (isLoggedIn()): ?>
            <li class="nav-item"><a href="dashboard.php">Dashboard</a></li>
        <?php endif; ?>
        <li class="nav-actions-mobile"></li>
      </ul>

      <div class="nav-actions">
        <?php if (isLoggedIn()): ?>
            <span style="margin-right: 15px;">Hi, <?php echo htmlspecialchars($_SESSION['name']); ?></span>
            <a href="actions/logout.php" class="btn btn-secondary">Logout</a>
        <?php else: ?>
            <a href="login.html" class="btn btn-secondary">Login</a>
            <a href="signup.html" class="btn btn-primary">Sign Up</a>
        <?php endif; ?>
      </div>

      <button class="hamburger" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>

  <!-- Main Explorer Section -->
  <section style="padding: 140px 0 80px 0; min-height: 90vh;">
    <div class="container">
      
      <!-- Page Header title -->
      <div style="margin-bottom: 40px;" class="reveal">
        <span style="color: var(--primary-color); font-weight: 600; font-size: 0.9rem; text-transform: uppercase;">Explore</span>
        <h2 style="font-size: 2.25rem; margin-top: 8px; font-weight: 700;">University Events</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Join coding challenges, cultural highlights, sports runs and academic discussions</p>
      </div>

      <!-- Filters & Search Toolbar (Client-Side filtering) -->
      <div class="filter-section reveal">
        <div class="search-row">
          <div style="position: relative;">
            <input type="text" id="event-search" class="form-control" placeholder="Search events by title, venue or location..." style="padding-left: 44px;" oninput="filterEvents()">
            <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 1.1rem; color: var(--text-muted);">🔍</span>
          </div>
          <div>
            <input type="date" id="event-date-filter" class="form-control" style="cursor: pointer;" onchange="filterEvents()">
          </div>
        </div>

        <div style="border-top: 1px solid rgba(226, 232, 240, 0.6); padding-top: 16px; display:flex; align-items:center; gap: 16px; flex-wrap:wrap;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-color);">Category:</span>
          <div class="filter-tags-container">
            <div class="filter-tag active" onclick="setCategory('All', this)">All Events</div>
            <div class="filter-tag" onclick="setCategory('Academic', this)">Academic / Tech</div>
            <div class="filter-tag" onclick="setCategory('Cultural', this)">Cultural / Jam</div>
            <div class="filter-tag" onclick="setCategory('Athletics', this)">Athletics / Sports</div>
          </div>
        </div>
      </div>

      <!-- Events Catalog Grid -->
      <div class="dashboard-events-grid" id="events-grid-container">
        <?php if (empty($events)): ?>
          <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: var(--white); border-radius: var(--radius-md); box-shadow: var(--card-shadow); border: 1px solid rgba(226, 232, 240, 0.8);">
            <div style="font-size: 2.5rem; margin-bottom: 16px;">🔍</div>
            <h4>No Events Found</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">Check back later for new events.</p>
          </div>
        <?php else: ?>
          <?php foreach ($events as $evt): ?>
            <?php 
              $isRegistered = in_array($evt['event_id'], $registeredEventIds);
              $isPast = strtotime($evt['date']) < strtotime(date('Y-m-d'));
            ?>
            <div class="glass-card hover-lift event-card" data-title="<?php echo strtolower(htmlspecialchars($evt['title'])); ?>" data-venue="<?php echo strtolower(htmlspecialchars($evt['location'])); ?>" data-category="<?php echo htmlspecialchars($evt['category']); ?>" data-date="<?php echo htmlspecialchars($evt['date']); ?>">
              <div style="height: 180px; position: relative; overflow: hidden;">
                <img src="<?php echo htmlspecialchars($evt['image_url'] ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'); ?>" alt="Event Image" style="width:100%; height:100%; object-fit:cover;">
                <span style="position: absolute; top: 16px; right: 16px; background: var(--primary-gradient); color: var(--white); font-size: 0.75rem; font-weight:600; padding: 4px 12px; border-radius:50px;">
                  <?php echo htmlspecialchars($evt['category']); ?>
                </span>
              </div>
              <div style="padding: 24px; flex-grow: 1; display: flex; flex-direction: column;">
                <span style="color: var(--accent-color); font-weight:600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display:block; margin-bottom: 4px;">
                  <?php echo htmlspecialchars($evt['club_name']); ?>
                </span>
                <h4 style="font-size: 1.15rem; margin-bottom: 12px;"><?php echo htmlspecialchars($evt['title']); ?></h4>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px; line-height: 1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                  <?php echo htmlspecialchars($evt['description']); ?>
                </p>
                <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid rgba(226, 232, 240, 0.5); padding-top: 16px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
                    <span>📅 <?php echo date('M j, Y', strtotime($evt['date'])); ?></span>
                    <span>🕒 <?php echo date('H:i', strtotime($evt['time'])); ?></span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    📍 <?php echo htmlspecialchars($evt['location']); ?>
                  </div>
                  
                  <?php if (isLoggedIn()): ?>
                    <form action="actions/register_event_process.php" method="POST" style="margin: 0;">
                      <input type="hidden" name="event_id" value="<?php echo htmlspecialchars($evt['event_id']); ?>">
                      <?php if ($isPast): ?>
                        <button type="button" class="btn btn-secondary" style="width: 100%;" disabled>Completed</button>
                      <?php elseif ($isRegistered): ?>
                        <button type="button" class="btn btn-secondary" style="width: 100%; border-color: var(--success-color); color: var(--success-color);" disabled>✓ Registered</button>
                      <?php else: ?>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Register Now</button>
                      <?php endif; ?>
                    </form>
                  <?php else: ?>
                    <a href="login.html" class="btn btn-primary" style="width: 100%; text-align: center; display: inline-block;">Login to Register</a>
                  <?php endif; ?>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>

    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>🏫 UniEvent</h3>
          <p>Connecting campus communities and students through modern events management solutions.</p>
        </div>
        <div class="footer-links-col">
          <h4>Navigation</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="events.php">Events Directory</a></li>
          </ul>
        </div>
        <div class="footer-links-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Student Union</a></li>
            <li><a href="#">Support Desk</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <h4>Contact Us</h4>
          <p>📞 +1 (555) 123-4567</p>
          <p>✉️ support@unievent.edu</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 UniEvent - University Event & Club Management System. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="js/app.js"></script>
  <script>
    // Simple client-side filtering for the rendered items
    let currentCategory = 'All';

    function setCategory(cat, el) {
      currentCategory = cat;
      document.querySelectorAll('.filter-tag').forEach(tag => tag.classList.remove('active'));
      el.classList.add('active');
      filterEvents();
    }

    function filterEvents() {
      const search = document.getElementById('event-search').value.toLowerCase();
      const date = document.getElementById('event-date-filter').value;
      const cards = document.querySelectorAll('.event-card');
      
      cards.forEach(card => {
        const title = card.getAttribute('data-title');
        const venue = card.getAttribute('data-venue');
        const cat = card.getAttribute('data-category');
        const evtDate = card.getAttribute('data-date');
        
        const matchesSearch = title.includes(search) || venue.includes(search);
        const matchesDate = date === '' || evtDate === date;
        const matchesCat = currentCategory === 'All' || cat.includes(currentCategory);
        
        if (matchesSearch && matchesDate && matchesCat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
