/**
 * UniEvent - Core Application JavaScript
 * Handles strict client-side validation, toast notifications, UI toggles.
 */

// Global mock/bridge database object for mockup JS backward compatibility
const db = {
  getCurrentUser: () => {
    return window.currentUser || null;
  },
  getEvents: () => {
    return Promise.resolve([]);
  },
  getMyEvents: () => {
    return Promise.resolve([]);
  },
  get: (key, defaultValue) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch(e) {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {}
  }
};

// Helper function to read cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
}

// Helper to check if user is logged in via cookie
function isUserLoggedIn() {
  return getCookie('student_name') !== null;
}

// 1. Toast Notification System
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

// 2. Form Validation & URL Parameter Handling
document.addEventListener('DOMContentLoaded', () => {
  // Page check for create-event.html static guard
  if (window.location.pathname.includes('create-event.html')) {
    if (!isUserLoggedIn()) {
      window.location.href = 'login.html?error=' + encodeURIComponent('Unauthorized. Please log in.');
      return;
    }
  }

  // Dynamic navbar sync based on student_name cookie
  const navActions = document.querySelector('.nav-actions');
  const navActionsMobile = document.querySelector('.nav-actions-mobile');
  const studentName = getCookie('student_name');

  if (navActions) {
    if (studentName) {
      navActions.innerHTML = `
        <span style="margin-right: 15px; font-weight: 500;">Hi, ${studentName}</span>
        <a href="actions/logout.php" class="btn btn-secondary">Logout</a>
      `;
      // Also inject Dashboard link in main navbar if logged in
      const navLinks = document.querySelector('.nav-links');
      if (navLinks && !navLinks.innerHTML.includes('dashboard.php')) {
        const dashboardLi = document.createElement('li');
        dashboardLi.className = 'nav-item';
        dashboardLi.innerHTML = '<a href="dashboard.php">Dashboard</a>';
        navLinks.appendChild(dashboardLi);
      }
    } else {
      navActions.innerHTML = `
        <a href="login.html" class="btn btn-secondary">Login</a>
        <a href="signup.html" class="btn btn-primary">Sign Up</a>
      `;
    }
  }

  if (navActionsMobile) {
    if (studentName) {
      navActionsMobile.innerHTML = `
        <a href="dashboard.php" class="btn btn-primary" style="margin-bottom: 10px; width: 100%;">Dashboard</a>
        <a href="actions/logout.php" class="btn btn-secondary" style="width: 100%;">Logout</a>
      `;
    } else {
      navActionsMobile.innerHTML = `
        <a href="login.html" class="btn btn-secondary" style="margin-bottom: 10px; width: 100%;">Login</a>
        <a href="signup.html" class="btn btn-primary" style="width: 100%;">Sign Up</a>
      `;
    }
  }

  // Check URL parameters for errors/success from PHP redirects
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('error')) {
    const errorMsg = decodeURIComponent(urlParams.get('error'));
    showToast(errorMsg, 'error');
    
    // Attempt to show in inline error div if exists
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    if (loginError && window.location.pathname.includes('login')) {
      loginError.textContent = errorMsg;
      loginError.style.display = 'block';
    }
    if (signupError && window.location.pathname.includes('signup')) {
      signupError.textContent = errorMsg;
      signupError.style.display = 'block';
    }
  }
  
  if (urlParams.has('success')) {
    const successMsg = decodeURIComponent(urlParams.get('success'));
    showToast(successMsg, 'success');
  }

  // Strict Client-Side Validation for Signup
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      const nameInput = document.getElementById('signup-name').value.trim();
      const passInput = document.getElementById('signup-pass').value;
      const confirmInput = document.getElementById('signup-confirm-pass').value;
      const idInput = document.getElementById('signup-id').value.trim();
      const errorDiv = document.getElementById('signup-error');
      
      errorDiv.style.display = 'none';
      let errorMsg = '';

      // Strict validation: Name should not contain numbers
      if (/\d/.test(nameInput)) {
        errorMsg = 'Full Name cannot contain numbers. Please retry with a valid name.';
      }
      // Password match
      else if (passInput !== confirmInput) {
        errorMsg = 'Passwords do not match. Please retry.';
      }
      // Password length
      else if (passInput.length < 6) {
        errorMsg = 'Password must be at least 6 characters long.';
      }
      // Basic Student ID format validation (expecting characters and numbers)
      else if (!/^[A-Za-z0-9\-/]+$/.test(idInput)) {
        errorMsg = 'Student ID format is invalid. Please retry.';
      }

      if (errorMsg) {
        e.preventDefault(); // Stop submission
        errorDiv.textContent = errorMsg;
        errorDiv.style.display = 'block';
        showToast(errorMsg, 'error');
      }
    });
  }

  // Strict Client-Side Validation for Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      const idInput = document.getElementById('login-student-id').value.trim();
      const errorDiv = document.getElementById('login-error');
      
      errorDiv.style.display = 'none';

      // Basic injection check
      if (/[<>]/.test(idInput)) {
        e.preventDefault();
        const errorMsg = 'Invalid characters in Student Number. Please retry.';
        errorDiv.textContent = errorMsg;
        errorDiv.style.display = 'block';
        showToast(errorMsg, 'error');
      }
    });
  }

  // 3. UI Interactions (Menu toggle, Loader, etc.)
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
    }, 300);
  }

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

  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('active');
      });
    });
  }
});
