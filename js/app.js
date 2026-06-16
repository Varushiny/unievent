/**
 * UniEvent - Core Application JavaScript
 * Handles strict client-side validation, toast notifications, UI toggles.
 */

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
