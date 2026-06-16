/**
 * UniEvent - Student Dashboard Scripts
 * Refactored to fetch profile statistics, calendar markers, and registrations from PHP APIs.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure user is logged in
  await authGuard();

  const currentUser = await db.getCurrentUser();
  if (!currentUser) return;

  // Initialize Sidebar details
  updateSidebarProfile(currentUser);

  // Setup Mobile Sidebar toggle
  setupMobileSidebar();

  // Setup Calendar
  await setupCalendar(currentUser.id);
});

// Update profile display in sidebar
function updateSidebarProfile(user) {
  const avatars = document.querySelectorAll('.user-avatar');
  avatars.forEach(avatar => {
    if (user.avatar) {
      avatar.innerHTML = `<img src="${user.avatar}" alt="User Avatar">`;
    } else {
      avatar.innerHTML = user.name.charAt(0);
    }
  });

  const nameEl = document.querySelector('.user-name');
  if (nameEl) nameEl.textContent = user.name;

  const roleEl = document.querySelector('.user-role');
  if (roleEl) {
    let roleText = 'Student';
    if (user.role === 'leader') roleText = 'Club Leader';
    if (user.role === 'admin') roleText = 'Administrator';
    roleEl.textContent = roleText;
  }
}

// Setup mobile sidebar toggler
function setupMobileSidebar() {
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
}

// Populate statistics cards
async function populateDashboardStats(userId) {
  const memberships = db.get('uni_memberships', []);
  const events = await db.getEvents();
  const myEvents = await db.getMyEvents();

  // Filter for user
  const userClubs = memberships.filter(m => m.studentId === userId);
  
  const regCountEl = document.getElementById('stat-regs-count');
  if (regCountEl) regCountEl.textContent = myEvents.length;

  const clubCountEl = document.getElementById('stat-clubs-count');
  if (clubCountEl) clubCountEl.textContent = userClubs.length;

  const upcomingCountEl = document.getElementById('stat-upcoming-count');
  if (upcomingCountEl) {
    // Count all events on or after today
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = events.filter(e => e.date >= today);
    upcomingCountEl.textContent = upcomingEvents.length;
  }
}

// Populate recent activity log (retains local activities tracking)
function populateRecentActivities(userId) {
  const container = document.getElementById('activity-list-container');
  if (!container) return;

  const activities = db.get('uni_activities', []);
  const userActivities = activities
    .filter(a => a.studentId === userId)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5); // display 5 items max

  if (userActivities.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 12px; font-size: 0.9rem;">
        No recent activities recorded.
      </div>
    `;
    return;
  }

  container.innerHTML = userActivities.map(act => {
    let icon = '🔔';
    let colorClass = '';
    
    if (act.type === 'club_join') {
      icon = '👥';
      colorClass = 'marker-green';
    } else if (act.type === 'event_register') {
      icon = '📅';
      colorClass = 'marker-amber';
    } else if (act.type === 'event_create') {
      icon = '➕';
      colorClass = 'marker-blue';
    }

    const timeString = formatRelativeTime(new Date(act.time));

    return `
      <div class="activity-item">
        <div class="activity-marker ${colorClass}">${icon}</div>
        <div class="activity-details">
          <span class="activity-text">${act.text}</span>
          <span class="activity-time">${timeString}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Helper to format activity timestamp
function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

// Populate Registered / Upcoming Events List
async function populateUpcomingEvents(userId) {
  const container = document.getElementById('dashboard-events-table-body');
  const emptyState = document.getElementById('dashboard-events-empty-state');
  
  if (!container) return;

  // Fetch student registered events asynchronously
  const userEvents = await db.getMyEvents();

  if (userEvents.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    container.parentElement.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.parentElement.style.display = 'table';

  container.innerHTML = userEvents.map(evt => {
    // Check if event is in the past
    const today = new Date().toISOString().split('T')[0];
    const isPast = evt.date < today;
    const statusText = isPast ? 'Completed' : 'Upcoming';
    const badgeClass = isPast ? 'badge-danger' : 'badge-success';

    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-color);">${evt.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${evt.clubName}</div>
        </td>
        <td>📅 ${formatDateString(evt.date)}<br>⏰ ${evt.time}</td>
        <td>📍 ${evt.venue}</td>
        <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
        <td>
          <button class="btn btn-secondary btn-cancel-reg" data-event-id="${evt.id}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-sm);">
            Cancel
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Cancel registration listeners
  container.querySelectorAll('.btn-cancel-reg').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const eventId = e.target.getAttribute('data-event-id');
      await cancelRegistration(userId, eventId);
    });
  });
}

function formatDateString(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Cancel registration function
async function cancelRegistration(userId, eventId) {
  const userEvents = await db.getMyEvents();
  const event = userEvents.find(e => e.id === eventId);
  const eventName = event ? event.title : 'Event';

  const result = await db.cancelEventRegistration(eventId);

  if (result.success) {
    // Add activity log
    let activities = db.get('uni_activities', []);
    activities.push({
      studentId: userId,
      type: 'event_cancel',
      text: `Cancelled registration for ${eventName}`,
      time: new Date().toISOString()
    });
    db.set('uni_activities', activities);

    showToast(`Registration for ${eventName} cancelled`, 'error');

    // Refresh page data
    await populateDashboardStats(userId);
    populateRecentActivities(userId);
    await populateUpcomingEvents(userId);
    await setupCalendar(userId);
  } else {
    showToast(result.message || 'Cancellation failed', 'error');
  }
}

// Build interactive calendar view
async function setupCalendar(userId) {
  const calTitle = document.getElementById('calendar-month-year');
  const calGrid = document.getElementById('calendar-grid-days');

  if (!calGrid || !calTitle) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  calTitle.textContent = `${monthNames[month]} ${year}`;

  // Get total days in month & starting day of week
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get user registered events for this month
  const userEvents = await db.getMyEvents();

  // Extract dates that have events
  const eventDates = userEvents
    .filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .map(e => new Date(e.date).getDate());

  let gridHTML = '';

  // Padding days
  for (let i = 0; i < firstDay; i++) {
    gridHTML += '<div class="calendar-day empty"></div>';
  }

  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    const isToday = day === now.getDate();
    const hasEvent = eventDates.includes(day);
    const dayClasses = [];
    
    if (isToday) dayClasses.push('active');
    if (hasEvent) dayClasses.push('has-event');

    gridHTML += `
      <div class="calendar-day ${dayClasses.join(' ')}" data-day="${day}">
        ${day}
      </div>
    `;
  }

  calGrid.innerHTML = gridHTML;

  // Add click listener for calendar days
  calGrid.querySelectorAll('.calendar-day:not(.empty)').forEach(el => {
    el.addEventListener('click', (e) => {
      const day = +e.target.getAttribute('data-day');
      const dayEvents = userEvents.filter(evt => {
        const d = new Date(evt.date);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
      });

      if (dayEvents.length > 0) {
        const eventsListHTML = dayEvents.map(e => `
          <div style="margin-bottom: 12px; padding: 10px; border-radius: var(--radius-sm); background: #F8FAFC; border-left: 4px solid var(--accent-color);">
            <div style="font-weight:600; font-size:0.95rem;">${e.title}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">🕒 ${e.time} | 📍 ${e.venue}</div>
          </div>
        `).join('');
        
        modalHelper.create(`Events on ${monthNames[month]} ${day}`, `
          <div style="font-family: var(--font-main);">
            <p style="margin-bottom: 16px; font-size:0.9rem; color: var(--text-muted);">Here are the events you are registered for on this day:</p>
            ${eventsListHTML}
          </div>
        `);
      } else {
        showToast(`No events registered for ${monthNames[month]} ${day}`, 'error');
      }
    });
  });
}
