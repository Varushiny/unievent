/**
 * UniEvent - Core Application JavaScript
 * Handles local storage mock database, toast notifications, modals, shared menus, and authentication guards.
 */

// 1. Mock Database Initializer
const DEFAULT_CLUBS = [
  { id: 'club-1', name: 'Coding Club', category: 'Academic', description: 'Explore software development, competitive programming, and cool hacks.', logo: '💻', members: 154 },
  { id: 'club-2', name: 'Music & Arts Society', category: 'Cultural', description: 'Bringing creative souls together for jam sessions, theater, and concerts.', logo: '🎨', members: 89 },
  { id: 'club-3', name: 'Sports Varsity Club', category: 'Athletics', description: 'Representing the university in basketball, football, running, and track.', logo: '🏆', members: 120 },
  { id: 'club-4', name: 'Debating Society', category: 'Academic', description: 'Fostering critical thinking, quick wit, and persuasive speech on global issues.', logo: '🗣️', members: 45 }
];

const DEFAULT_EVENTS = [
  { id: 'evt-1', title: 'UniHack 2026', clubId: 'club-1', clubName: 'Coding Club', date: '2026-06-25', time: '09:00', venue: 'Campus Innovation Hub', category: 'Academic', description: 'A 24-hour hackathon where students build prototypes to solve real-world problems. Great prizes and food are provided!', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60' },
  { id: 'evt-2', title: 'Spring Jam Concert', clubId: 'club-2', clubName: 'Music & Arts Society', date: '2026-06-30', time: '18:00', venue: 'Open Air Theater', category: 'Cultural', description: 'A musical night featuring live student bands, art displays, food trucks, and absolute fun under the stars.', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60' },
  { id: 'evt-3', title: 'Annual Athletics Meet', clubId: 'club-3', clubName: 'Sports Varsity Club', date: '2026-07-05', time: '08:00', venue: 'University Sports Stadium', category: 'Athletics', description: 'Watch or compete in the ultimate showcase of speed, endurance, and strength. Registrations open for all athletes.', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=60' },
  { id: 'evt-4', title: 'Debate Finals 2026', clubId: 'club-4', clubName: 'Debating Society', date: '2026-06-18', time: '14:30', venue: 'Main Auditorium', category: 'Academic', description: 'The grand finale of the inter-faculty championship. Witness students debate critical issues about AI and ethics.', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60' }
];

const DEFAULT_USERS = [
  { id: 'usr-1', name: 'Alex Mercer', studentId: 'ST-2024-001', email: 'student@unievent.com', password: 'password123', faculty: 'Engineering', department: 'Computer Science', role: 'student', avatar: '' },
  { id: 'usr-2', name: 'Dr. Sarah Connor', studentId: 'FA-2021-042', email: 'leader@unievent.com', password: 'password123', faculty: 'Science', department: 'Mathematics', role: 'leader', avatar: '' },
  { id: 'usr-3', name: 'Admin User', studentId: 'AD-2020-001', email: 'admin@unievent.com', password: 'password123', faculty: 'Administration', department: 'Operations', role: 'admin', avatar: '' }
];

const DEFAULT_MEMBERSHIPS = [
  { clubId: 'club-1', studentId: 'usr-1', joinedAt: '2026-05-10' },
  { clubId: 'club-2', studentId: 'usr-1', joinedAt: '2026-05-18' }
];

const DEFAULT_REGISTRATIONS = [
  { eventId: 'evt-1', studentId: 'usr-1', registeredAt: '2026-05-12' }
];

const DEFAULT_ACTIVITIES = [
  { studentId: 'usr-1', type: 'club_join', text: 'Joined the Coding Club', time: '2026-05-10T11:24:00Z' },
  { studentId: 'usr-1', type: 'event_register', text: 'Registered for UniHack 2026', time: '2026-05-12T14:35:00Z' },
  { studentId: 'usr-1', type: 'club_join', text: 'Joined the Music & Arts Society', time: '2026-05-18T16:05:00Z' }
];

// Helper to interact with Local Storage
const db = {
  get: (key, defaultVal) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return defaultVal;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  },
  init: () => {
    if (!localStorage.getItem('uni_users')) db.set('uni_users', DEFAULT_USERS);
    if (!localStorage.getItem('uni_clubs')) db.set('uni_clubs', DEFAULT_CLUBS);
    if (!localStorage.getItem('uni_events')) db.set('uni_events', DEFAULT_EVENTS);
    if (!localStorage.getItem('uni_memberships')) db.set('uni_memberships', DEFAULT_MEMBERSHIPS);
    if (!localStorage.getItem('uni_registrations')) db.set('uni_registrations', DEFAULT_REGISTRATIONS);
    if (!localStorage.getItem('uni_activities')) db.set('uni_activities', DEFAULT_ACTIVITIES);
    if (!localStorage.getItem('uni_current_user')) db.set('uni_current_user', null);
  },
  getCurrentUser: () => db.get('uni_current_user', null),
  setCurrentUser: (user) => db.set('uni_current_user', user)
};

// Initialize DB immediately
db.init();

// 2. Toast Notification System
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : '✗';
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger anim
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove
  const timeoutId = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 4000);

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timeoutId);
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 350);
  });
}

// 3. Modal Utilities
const modalHelper = {
  create: (title, contentHTML, onConfirm = null) => {
    const modalId = 'dynamic-modal-' + Date.now();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = modalId;
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${contentHTML}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel">Cancel</button>
          ${onConfirm ? `<button class="btn btn-primary modal-confirm">Confirm</button>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('show');

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 400);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);

    if (onConfirm) {
      modal.querySelector('.modal-confirm').addEventListener('click', () => {
        onConfirm(closeModal);
      });
    }

    // click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    return modalId;
  }
};

// 4. Global Animations, Controls and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Page Loader dismissal
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
    }, 300);
  }

  // Header Scroll reveal
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Hamburger toggling
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('active');
    });

    // close on clicking menu item
    navLinks.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('active');
      });
    });
  }

  // Set Nav Items dynamic login state
  updateNavbarAuthUI();

  // Scroll Reveal triggers
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // Animated Counters
  const counters = document.querySelectorAll('.count-number');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = +counter.getAttribute('data-target');
          const duration = 1500; // ms
          const stepTime = Math.max(Math.floor(duration / target), 15);
          let current = 0;
          
          const timer = setInterval(() => {
            current += Math.ceil(target / (duration / stepTime));
            if (current >= target) {
              counter.innerText = target;
              clearInterval(timer);
            } else {
              counter.innerText = current;
            }
          }, stepTime);
          
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(c => counterObserver.observe(c));
  }

  // Initialize canvas particle animations
  initParticles();
});

// Update standard pages navbar to reflect current user status
function updateNavbarAuthUI() {
  const container = document.querySelector('.nav-actions');
  const mobileContainer = document.querySelector('.nav-actions-mobile');
  const currentUser = db.getCurrentUser();

  if (!container) return;

  if (currentUser) {
    // Show Dashboard / Profile Dropdown instead of login/signup
    const userUI = `
      <div class="dropdown" id="user-nav-dropdown">
        <div class="dropdown-toggle">
          <div class="user-avatar" style="width: 38px; height: 38px; font-size: 0.95rem;">
            ${currentUser.avatar ? `<img src="${currentUser.avatar}">` : currentUser.name.charAt(0)}
          </div>
          <span style="font-weight:500; font-size: 0.95rem; cursor:pointer;">${currentUser.name.split(' ')[0]} ▾</span>
        </div>
        <div class="dropdown-menu">
          <a href="dashboard.html" class="dropdown-item">📊 Dashboard</a>
          <a href="profile.html" class="dropdown-item">👤 Profile</a>
          <a href="#" class="dropdown-item" id="logout-btn">🚪 Logout</a>
        </div>
      </div>
    `;

    container.innerHTML = userUI;

    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <a href="dashboard.html" class="btn btn-primary">📊 Dashboard</a>
        <a href="#" class="btn btn-secondary" id="logout-btn-mob">🚪 Logout</a>
      `;
    }

    // Toggle dropdown
    const toggle = document.querySelector('.dropdown-toggle');
    const menu = document.querySelector('.dropdown-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        menu.classList.remove('show');
      });
    }

    // Logout handling
    const performLogout = (e) => {
      e.preventDefault();
      db.setCurrentUser(null);
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    };

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', performLogout);

    const logoutBtnMob = document.getElementById('logout-btn-mob');
    if (logoutBtnMob) logoutBtnMob.addEventListener('click', performLogout);

  } else {
    // Show standard Login / Signup
    const guestUI = `
      <a href="login.html" class="btn btn-secondary btn-animate">Login</a>
      <a href="signup.html" class="btn btn-primary btn-animate">Sign Up</a>
    `;

    container.innerHTML = guestUI;

    if (mobileContainer) {
      mobileContainer.innerHTML = guestUI;
    }
  }
}

// Auth Guards for Dashboard views
function authGuard() {
  const user = db.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

// Particle System Renderer
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 40;

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 20;
      this.size = Math.random() * 2.5 + 1.2;
      this.speedY = -(Math.random() * 0.35 + 0.1);
      this.speedX = (Math.random() * 0.16 - 0.08);
      this.opacity = Math.random() * 0.25 + 0.05;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}
