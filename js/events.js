/**
 * UniEvent - Events and Profile Scripting
 * Handles event filters and search, registrations, profile modifications, and event creation validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = db.getCurrentUser();

  // 1. Events Page Handler
  if (document.getElementById('events-grid-container')) {
    initEventsPage(currentUser);
  }

  // 2. Create Event Page Handler
  if (document.getElementById('create-event-form')) {
    initCreateEventPage(currentUser);
  }

  // 3. Profile Page Handler
  if (document.getElementById('profile-edit-form') || document.getElementById('profile-page-view')) {
    initProfilePage(currentUser);
  }
});

// ==========================================
// 1. EVENTS EXPLORER PAGE
// ==========================================
function initEventsPage(user) {
  const searchInput = document.getElementById('event-search');
  const categoryFilters = document.querySelectorAll('.filter-tag');
  const dateFilter = document.getElementById('event-date-filter');
  const gridContainer = document.getElementById('events-grid-container');

  let activeCategory = 'All';

  const renderEvents = () => {
    const events = db.get('uni_events', []);
    const registrations = db.get('uni_registrations', []);
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedDate = dateFilter ? dateFilter.value : '';

    let filteredEvents = events.filter(evt => {
      // Search matches
      const matchesSearch = evt.title.toLowerCase().includes(searchText) || 
                            evt.clubName.toLowerCase().includes(searchText) || 
                            evt.venue.toLowerCase().includes(searchText);
      
      // Category matches
      const matchesCategory = activeCategory === 'All' || evt.category.toLowerCase() === activeCategory.toLowerCase();

      // Date matches
      const matchesDate = !selectedDate || evt.date === selectedDate;

      return matchesSearch && matchesCategory && matchesDate;
    });

    if (filteredEvents.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: var(--white); border-radius: var(--radius-md); box-shadow: var(--card-shadow); border: 1px solid rgba(226, 232, 240, 0.8);">
          <div style="font-size: 2.5rem; margin-bottom: 16px;">🔍</div>
          <h4>No Events Found</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">Try adjusting your filters or search keywords.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filteredEvents.map(evt => {
      const isRegistered = user ? registrations.some(r => r.studentId === user.id && r.eventId === evt.id) : false;
      const today = new Date().toISOString().split('T')[0];
      const isPast = evt.date < today;

      let btnHTML = '';
      if (isPast) {
        btnHTML = `<button class="btn btn-secondary" style="width: 100%;" disabled>Completed</button>`;
      } else if (isRegistered) {
        btnHTML = `<button class="btn btn-secondary btn-register-toggle" data-event-id="${evt.id}" style="width: 100%; border-color: var(--success-color); color: var(--success-color);">✓ Registered</button>`;
      } else {
        btnHTML = `<button class="btn btn-primary btn-register-toggle" data-event-id="${evt.id}" style="width: 100%;">Register Now</button>`;
      }

      return `
        <div class="glass-card hover-lift event-card">
          <div style="height: 180px; position: relative; overflow: hidden;">
            <img src="${evt.image}" alt="${evt.title}" style="width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease;">
            <span style="position: absolute; top: 16px; right: 16px; background: var(--primary-gradient); color: var(--white); font-size: 0.75rem; font-weight:600; padding: 4px 12px; border-radius:50px;">
              ${evt.category}
            </span>
          </div>
          <div style="padding: 24px; flex-grow: 1; display: flex; flex-direction: column;">
            <span style="color: var(--accent-color); font-weight:600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display:block; margin-bottom: 4px;">
              ${evt.clubName}
            </span>
            <h4 style="font-size: 1.15rem; margin-bottom: 12px; cursor: pointer;" class="event-title-click" data-event-id="${evt.id}">${evt.title}</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px; line-height: 1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
              ${evt.description}
            </p>
            <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid rgba(226, 232, 240, 0.5); padding-top: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
                <span>📅 ${formatDateString(evt.date)}</span>
                <span>🕒 ${evt.time}</span>
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                📍 ${evt.venue}
              </div>
              ${btnHTML}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Register button togglers
    gridContainer.querySelectorAll('.btn-register-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!user) {
          showToast('Please log in to register for events', 'error');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
          return;
        }
        const eventId = e.target.getAttribute('data-event-id');
        toggleEventRegistration(user.id, eventId);
      });
    });

    // Details modal trigger
    gridContainer.querySelectorAll('.event-title-click').forEach(title => {
      title.addEventListener('click', (e) => {
        const eventId = e.target.getAttribute('data-event-id');
        openEventDetailsModal(eventId, user);
      });
    });
  };

  // Attach filters events
  if (searchInput) searchInput.addEventListener('input', renderEvents);
  if (dateFilter) dateFilter.addEventListener('change', renderEvents);
  
  categoryFilters.forEach(tag => {
    tag.addEventListener('click', (e) => {
      categoryFilters.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.getAttribute('data-category');
      renderEvents();
    });
  });

  // Initial draw
  renderEvents();
}

// Toggle Event Enrollment
function toggleEventRegistration(userId, eventId) {
  let registrations = db.get('uni_registrations', []);
  const events = db.get('uni_events', []);
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  const isRegisteredIndex = registrations.findIndex(r => r.studentId === userId && r.eventId === eventId);

  let activities = db.get('uni_activities', []);

  if (isRegisteredIndex > -1) {
    // Cancel
    registrations.splice(isRegisteredIndex, 1);
    db.set('uni_registrations', registrations);
    
    activities.push({
      studentId: userId,
      type: 'event_cancel',
      text: `Cancelled registration for ${event.title}`,
      time: new Date().toISOString()
    });
    db.set('uni_activities', activities);
    
    showToast(`Cancelled registration for ${event.title}`, 'error');
  } else {
    // Add
    registrations.push({
      studentId: userId,
      eventId: eventId,
      registeredAt: new Date().toISOString().split('T')[0]
    });
    db.set('uni_registrations', registrations);

    activities.push({
      studentId: userId,
      type: 'event_register',
      text: `Registered for ${event.title}`,
      time: new Date().toISOString()
    });
    db.set('uni_activities', activities);

    showToast(`Registered successfully for ${event.title}!`, 'success');
  }

  // Redraw if in event lists page
  if (document.getElementById('events-grid-container')) {
    initEventsPage(db.getCurrentUser());
  }
}

// Event Details popup dialog
function openEventDetailsModal(eventId, user) {
  const events = db.get('uni_events', []);
  const registrations = db.get('uni_registrations', []);
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  const isRegistered = user ? registrations.some(r => r.studentId === user.id && r.eventId === evt.id) : false;
  const today = new Date().toISOString().split('T')[0];
  const isPast = evt.date < today;

  let btnLabel = 'Register Now';
  let btnClass = 'btn-primary';
  if (isPast) {
    btnLabel = 'Completed';
    btnClass = 'btn-secondary';
  } else if (isRegistered) {
    btnLabel = 'Cancel Registration';
    btnClass = 'btn-accent';
  }

  const canEdit = user && (user.id === evt.authorId || user.role === 'admin');
  let editBtnHTML = canEdit ? `<button class="btn btn-secondary" id="btn-edit-event-${evt.id}" style="margin-top: 12px; width: 100%;">✏️ Edit Event</button>` : '';

  const modalBody = `
    <div style="font-family: var(--font-main);">
      <div style="width: 100%; height: 200px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 16px;">
        <img src="${evt.image}" alt="${evt.title}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <span style="color: var(--secondary-color); font-weight: 600; font-size: 0.85rem; text-transform: uppercase;">${evt.clubName}</span>
      <h3 style="margin-bottom: 12px; font-size: 1.4rem;">${evt.title}</h3>
      <p style="font-size: 0.9rem; color: var(--text-color); margin-bottom: 20px; line-height: 1.6;">${evt.description}</p>
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem; padding: 12px 16px; background: #F8FAFC; border-radius: var(--radius-sm); border: 1px solid #E2E8F0; margin-bottom: 8px;">
        <div>📅 <strong>Date:</strong> ${formatDateString(evt.date)}</div>
        <div>🕒 <strong>Time:</strong> ${evt.time}</div>
        <div style="grid-column: 1/-1;">📍 <strong>Venue:</strong> ${evt.venue}</div>
      </div>
      ${editBtnHTML}
    </div>
  `;

  const modalId = modalHelper.create(
    'Event Details', 
    modalBody, 
    isPast ? null : (closeModal) => {
      if (!user) {
        showToast('Please log in to register', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
      }
      toggleEventRegistration(user.id, eventId);
      closeModal();
      // redraw events list page if active
      if (document.getElementById('events-grid-container')) {
        initEventsPage(db.getCurrentUser());
      }
    }
  );

  // adjust confirm button text
  setTimeout(() => {
    const confirmBtn = document.querySelector('.modal-confirm');
    if (confirmBtn) {
      confirmBtn.className = `btn ${btnClass} modal-confirm`;
      confirmBtn.textContent = btnLabel;
    }
    
    // Attach edit button listener
    const editBtn = document.getElementById(`btn-edit-event-${evt.id}`);
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const m = document.getElementById(modalId);
        if (m) {
          m.classList.remove('show');
          setTimeout(() => m.remove(), 400);
        }
        openEditEventModal(eventId, user);
      });
    }
  }, 10);
}

// Edit Event Details modal
function openEditEventModal(eventId, user) {
  const events = db.get('uni_events', []);
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  const modalBody = `
    <form id="edit-event-form-${evt.id}" style="font-family: var(--font-main);">
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label">Title</label>
        <input type="text" id="edit-title" class="form-control" value="${evt.title}" required>
      </div>
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label">Date</label>
        <input type="date" id="edit-date" class="form-control" value="${evt.date}" required>
      </div>
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label">Time</label>
        <input type="time" id="edit-time" class="form-control" value="${evt.time}" required>
      </div>
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label">Venue</label>
        <input type="text" id="edit-venue" class="form-control" value="${evt.venue}" required>
      </div>
      <div class="form-group" style="margin-bottom: 12px;">
        <label class="form-label">Description</label>
        <textarea id="edit-desc" class="form-control" rows="4" required>${evt.description}</textarea>
      </div>
    </form>
  `;

  modalHelper.create(
    'Edit Event',
    modalBody,
    (closeModal) => {
      const title = document.getElementById('edit-title').value.trim();
      const date = document.getElementById('edit-date').value;
      const time = document.getElementById('edit-time').value;
      const venue = document.getElementById('edit-venue').value.trim();
      const description = document.getElementById('edit-desc').value.trim();

      if (!title || !date || !time || !venue || !description) {
        showToast('All fields are required', 'error');
        return;
      }

      const eventsList = db.get('uni_events', []);
      const index = eventsList.findIndex(e => e.id === eventId);
      if (index > -1) {
        eventsList[index] = { ...eventsList[index], title, date, time, venue, description };
        db.set('uni_events', eventsList);
        showToast('Event updated successfully!', 'success');
        
        let activities = db.get('uni_activities', []);
        activities.push({
          studentId: user.id,
          type: 'event_edit',
          text: `Edited event: ${title}`,
          time: new Date().toISOString()
        });
        db.set('uni_activities', activities);

        closeModal();
        if (document.getElementById('events-grid-container')) {
          initEventsPage(user);
        }
      }
    }
  );
  
  setTimeout(() => {
    const confirmBtn = document.querySelector('.modal-confirm');
    if (confirmBtn) {
      confirmBtn.textContent = 'Save Changes';
    }
  }, 10);
}


// ==========================================
// 2. CREATE EVENT PAGE
// ==========================================
function initCreateEventPage(user) {
  // Guard access - any registered person can create events
  if (!user) {
    showToast('Permission denied. You must log in to create events.', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return;
  }

  const form = document.getElementById('create-event-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const venue = document.getElementById('event-venue').value.trim();
    const category = document.getElementById('event-category').value;
    const description = document.getElementById('event-desc').value.trim();
    
    // Default mock images array
    const demoImages = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60'
    ];
    const image = demoImages[Math.floor(Math.random() * demoImages.length)];

    if (!title || !date || !time || !venue || !description) {
      showToast('All fields are required', 'error');
      return;
    }

    const newEvent = {
      id: 'evt-' + Date.now(),
      title,
      clubId: '',
      clubName: 'Independent',
      date,
      time,
      venue,
      category,
      description,
      image,
      authorId: user.id
    };

    // Save
    let events = db.get('uni_events', []);
    events.push(newEvent);
    db.set('uni_events', events);

    // Save Activity log
    let activities = db.get('uni_activities', []);
    activities.push({
      studentId: user.id,
      type: 'event_create',
      text: `Created new event: ${title}`,
      time: new Date().toISOString()
    });
    db.set('uni_activities', activities);

    showToast('Event created successfully!', 'success');
    form.reset();

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  });
}


// ==========================================
// 3. PROFILE PAGE
// ==========================================
function initProfilePage(user) {
  authGuard();
  if (!user) return;

  // Render details
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const idInput = document.getElementById('profile-id');
  const facultySelect = document.getElementById('profile-faculty');
  const deptInput = document.getElementById('profile-dept');
  const titleName = document.getElementById('profile-title-name');
  const titleRole = document.getElementById('profile-title-role');

  if (titleName) titleName.textContent = user.name;
  if (titleRole) {
    let roleStr = 'Student';
    if (user.role === 'leader') roleStr = 'Club Leader';
    if (user.role === 'admin') roleStr = 'Administrator';
    titleRole.textContent = roleStr;
  }

  if (nameInput) nameInput.value = user.name;
  if (emailInput) emailInput.value = user.email;
  if (idInput) idInput.value = user.studentId;
  if (facultySelect) facultySelect.value = user.faculty || 'Engineering';
  if (deptInput) deptInput.value = user.department || '';

  // Render enrolled events inside profile lists
  populateProfileLists(user.id);

  // Edit form submit
  const form = document.getElementById('profile-edit-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const updatedUser = {
        ...user,
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        faculty: facultySelect.value,
        department: deptInput.value.trim()
      };

      if (!updatedUser.name || !updatedUser.email) {
        showToast('Name and Email cannot be empty', 'error');
        return;
      }

      // Update in users DB
      let users = db.get('uni_users', []);
      const index = users.findIndex(u => u.id === user.id);
      if (index > -1) {
        users[index] = updatedUser;
        db.set('uni_users', users);
        db.setCurrentUser(updatedUser);
        
        showToast('Profile updated successfully!', 'success');
        if (titleName) titleName.textContent = updatedUser.name;
        
        // update header if applicable
        updateNavbarAuthUI();
      }
    });
  }
}

function populateProfileLists(userId) {
  const eventsContainer = document.getElementById('profile-events-list');

  const registrations = db.get('uni_registrations', []);
  const events = db.get('uni_events', []);

  // Events list drawing
  if (eventsContainer) {
    const userRegs = registrations.filter(r => r.studentId === userId);
    const userEvents = events.filter(e => userRegs.some(r => r.eventId === e.id));

    if (userEvents.length === 0) {
      eventsContainer.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.85rem; padding: 12px 0;">
          No events registered yet. Explore the <a href="index.html" style="color: var(--secondary-color); font-weight:500;">Events page</a> to sign up!
        </div>
      `;
    } else {
      eventsContainer.innerHTML = userEvents.map(evt => `
        <div class="glass-card profile-list-item">
          <div>
            <div style="font-weight:600; font-size: 0.95rem;">${evt.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">📅 ${formatDateString(evt.date)} | 📍 ${evt.venue}</div>
          </div>
          <button class="btn btn-secondary btn-cancel-profile-reg" data-event-id="${evt.id}" style="padding: 6px 12px; font-size: 0.8rem;">
            Cancel
          </button>
        </div>
      `).join('');

      eventsContainer.querySelectorAll('.btn-cancel-profile-reg').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eventId = e.target.getAttribute('data-event-id');
          toggleEventRegistration(userId, eventId);
          populateProfileLists(userId); // redraw
        });
      });
    }
  }
}
