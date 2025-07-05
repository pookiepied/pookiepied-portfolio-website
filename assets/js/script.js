/**
 * POOKIEPIED Portfolio - Professional JavaScript (FIXED)
 * Enhanced performance, accessibility, and maintainability
 * ========================================================================
 */

class PortfolioApp {
  constructor() {
    this.config = {
      scrollThrottle: 16, // ~60fps
      autoSlideInterval: 5000, // 5 seconds
      interactionPause: 3000, // 3 seconds
      swipeThreshold: 50, // pixels
      successMessageDuration: 4000, // 4 seconds
      errorMessageDuration: 3000, // 3 seconds
      animationDelay: 500, // milliseconds
      wheelThrottle: 150, // Mouse wheel throttle in ms (increased for better control)
      scrollDuration: 450, // Smooth scroll duration in ms
      keyboardScrollDuration: 350, // Faster for keyboard navigation
    };

    this.state = {
      currentProject: 0,
      isDragging: false,
      autoSlideTimer: null,
      scrollTimer: null,
      touchStartX: 0,
      touchCurrentX: 0,
      currentSection: 0,
      isScrolling: false,
      wheelTimeout: null,
      lastWheelTime: 0, // Track last wheel event time
    };

    this.elements = this.cacheElements();
    this.init();
  }

  /**
   * Cache DOM elements for better performance
   */
  cacheElements() {
    return {
      container: document.getElementById('container'),
      navLinks: document.querySelectorAll('.dot-nav a'),
      sections: document.querySelectorAll('section'),
      slider: document.querySelector('.projects-slider'),
      projects: document.querySelectorAll('.project-card'),
      indicatorsContainer: document.querySelector('.project-indicators'),
      contactForm: document.querySelector('.contact-form'),
      emailInput: document.querySelector('input[name="email"]'),
      emailLabel: document.querySelector('input[name="email"] + .form-label'),
      messageTextarea: document.querySelector('textarea[name="message"]'),
      messageLabel: document.querySelector('textarea[name="message"] + .form-label'),
      messageGroup: document.querySelector('.message-group'),
      submitBtn: document.querySelector('.submit-btn'),
      successMessage: document.querySelector('.success-message'),
    };
  }

  /**
   * Initialize all components
   */
  init() {
    this.initNavigation();
    this.initProjectSlider();
    this.initContactForm();
    this.initMouseWheelNavigation();
    this.bindEvents();
    this.updateCurrentSection(); // Initialize current section
  }

  /**
   * Initialize mouse wheel navigation
   */
  initMouseWheelNavigation() {
    const { container } = this.elements;
    
    if (!container) return;

    // Disable default scroll behavior
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.handleWheelScroll(e);
    }, { passive: false });

    // Initialize current section based on initial scroll position
    this.updateCurrentSection();
    this.updateActiveNavigation();
  }

  /**
   * Handle mouse wheel scrolling with smooth navigation
   */
  handleWheelScroll(e) {
    const now = Date.now();
    
    // Throttle wheel events more effectively
    if (now - this.state.lastWheelTime < this.config.wheelThrottle) {
      return;
    }
    
    // Prevent multiple wheel events from interfering
    if (this.state.isScrolling) return;

    this.state.lastWheelTime = now;

    // Clear any existing wheel timeout
    if (this.state.wheelTimeout) {
      clearTimeout(this.state.wheelTimeout);
    }

    // Set a timeout to detect when wheel scrolling has stopped
    this.state.wheelTimeout = setTimeout(() => {
      const totalSections = this.elements.sections.length;
      const deltaY = e.deltaY;
      
      // Determine scroll direction with a small threshold to prevent accidental scrolling
      if (Math.abs(deltaY) < 5) return;
      
      if (deltaY > 0) {
        // Scroll down
        if (this.state.currentSection < totalSections - 1) {
          this.smoothScrollToSection(this.state.currentSection + 1);
        }
      } else {
        // Scroll up
        if (this.state.currentSection > 0) {
          this.smoothScrollToSection(this.state.currentSection - 1);
        }
      }
    }, 50); // Reduced timeout for more responsive scrolling
  }

  /**
   * Smooth scroll to a specific section
   */
  smoothScrollToSection(index, duration = null) {
    const { sections, container } = this.elements;
    
    if (!sections[index] || !container) return;
    
    // Use custom duration or default
    const scrollDuration = duration || this.config.scrollDuration;
    
    this.state.isScrolling = true;
    this.state.currentSection = index;
    
    const targetSection = sections[index];
    const targetPosition = targetSection.offsetTop;
    const startPosition = container.scrollTop;
    const distance = targetPosition - startPosition;
    
    // If distance is very small, just jump to position
    if (Math.abs(distance) < 5) {
      container.scrollTop = targetPosition;
      this.state.isScrolling = false;
      this.updateActiveNavigation();
      return;
    }
    
    let startTime = null;
    
    const animateScroll = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / scrollDuration, 1);
      
      // Easing function (ease-out for smoother feel)
      const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
      
      const easedProgress = easeOutQuart(progress);
      const currentPosition = startPosition + distance * easedProgress;
      
      container.scrollTop = currentPosition;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        this.state.isScrolling = false;
        this.updateActiveNavigation();
      }
    };
    
    requestAnimationFrame(animateScroll);
  }

  /**
   * Update current section based on scroll position
   */
  updateCurrentSection() {
    const { container, sections } = this.elements;
    
    if (!container || sections.length === 0) return;
    
    const scrollPos = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    // Find the section that's most visible
    let newCurrentSection = 0;
    let maxVisibleArea = 0;
    
    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionBottom = sectionTop + sectionHeight;
      
      // Calculate visible area of this section
      const visibleTop = Math.max(scrollPos, sectionTop);
      const visibleBottom = Math.min(scrollPos + containerHeight, sectionBottom);
      const visibleArea = Math.max(0, visibleBottom - visibleTop);
      
      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        newCurrentSection = index;
      }
    });
    
    this.state.currentSection = newCurrentSection;
  }

  /**
   * Initialize navigation functionality
   */
  initNavigation() {
    const { navLinks, container } = this.elements;

    // Navigation click handlers
    navLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.smoothScrollToSection(index);
      });
    });

    // Scroll-based active navigation (for manual scrolling detection)
    container.addEventListener('scroll', this.throttle(() => {
      if (!this.state.isScrolling) {
        this.updateCurrentSection();
        this.updateActiveNavigation();
      }
    }, this.config.scrollThrottle));
  }

  /**
   * Initialize project slider
   */
  initProjectSlider() {
    const { slider, projects, indicatorsContainer } = this.elements;
    
    if (!slider || projects.length === 0) return;

    const totalProjects = projects.length;
    
    // Set slider width and project dimensions
    slider.style.width = `${totalProjects * 100}%`;
    projects.forEach(project => {
      project.style.flex = `0 0 ${100 / totalProjects}%`;
    });

    // Initialize first project as active
    projects[0]?.classList.add('active');

    if (totalProjects > 1) {
      this.createProjectIndicators();
      this.initSliderInteraction();
      this.startAutoSlide();
      
      // Show indicators after initial animation
      setTimeout(() => {
        indicatorsContainer?.classList.add('visible');
      }, this.config.animationDelay);
    } else {
      // Hide indicators for single project
      if (indicatorsContainer) {
        indicatorsContainer.style.display = 'none';
      }
    }
  }

  /**
   * Create project navigation indicators
   */
  createProjectIndicators() {
    const { indicatorsContainer, projects } = this.elements;
    
    if (!indicatorsContainer) return;
    
    indicatorsContainer.innerHTML = '';
    
    projects.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('line');
      indicator.setAttribute('role', 'tab');
      indicator.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      indicator.setAttribute('aria-label', `Project ${index + 1}`);
      
      if (index === 0) indicator.classList.add('active');
      
      indicator.addEventListener('click', () => {
        this.goToProject(index);
      });
      
      indicatorsContainer.appendChild(indicator);
    });
  }

  /**
   * Initialize slider touch/mouse interaction
   */
  initSliderInteraction() {
    const { slider } = this.elements;
    
    if (!slider) return;

    // Touch events
    slider.addEventListener('touchstart', (e) => this.handleInteractionStart(e), { passive: true });
    slider.addEventListener('touchmove', (e) => this.handleInteractionMove(e), { passive: false });
    slider.addEventListener('touchend', () => this.handleInteractionEnd(), { passive: true });
    
    // Mouse events
    slider.addEventListener('mousedown', (e) => this.handleInteractionStart(e));
    slider.addEventListener('mousemove', (e) => this.handleInteractionMove(e));
    slider.addEventListener('mouseup', () => this.handleInteractionEnd());
    slider.addEventListener('mouseleave', () => this.handleInteractionEnd());
    
    // Prevent context menu on long press
    slider.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Handle interaction start (touch/mouse)
   */
  handleInteractionStart(e) {
    this.state.isDragging = true;
    this.state.touchStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    this.pauseAutoSlide();
  }

  /**
   * Handle interaction move (touch/mouse)
   */
  handleInteractionMove(e) {
    if (!this.state.isDragging) return;
    
    e.preventDefault();
    this.state.touchCurrentX = (e.type === 'mousemove' ? e.clientX : e.touches[0].clientX) - this.state.touchStartX;
  }

  /**
   * Handle interaction end (touch/mouse)
   */
  handleInteractionEnd() {
    if (!this.state.isDragging) return;
    
    this.state.isDragging = false;
    
    const { touchCurrentX } = this.state;
    const { swipeThreshold } = this.config;
    const totalProjects = this.elements.projects.length;
    
    // Determine swipe direction
    if (touchCurrentX > swipeThreshold && this.state.currentProject > 0) {
      this.state.currentProject--;
    } else if (touchCurrentX < -swipeThreshold && this.state.currentProject < totalProjects - 1) {
      this.state.currentProject++;
    }
    
    this.updateSlider();
    this.state.touchCurrentX = 0;
    
    // Resume auto-slide after interaction
    setTimeout(() => {
      this.startAutoSlide();
    }, this.config.interactionPause);
  }

  /**
   * Initialize contact form
   */
  initContactForm() {
    const { contactForm, emailInput, emailLabel, messageTextarea, messageLabel } = this.elements;
    
    if (!contactForm) return;

    // Input event listeners
    if (emailInput && emailLabel) {
      emailInput.addEventListener('input', () => {
        this.updateLabel(emailInput, emailLabel);
        this.validateForm();
      });
      emailInput.addEventListener('focus', () => this.updateLabel(emailInput, emailLabel));
      emailInput.addEventListener('blur', () => this.updateLabel(emailInput, emailLabel));
    }

    if (messageTextarea && messageLabel) {
      messageTextarea.addEventListener('input', () => {
        this.updateLabel(messageTextarea, messageLabel);
        this.validateForm();
      });
      messageTextarea.addEventListener('focus', () => this.updateLabel(messageTextarea, messageLabel));
      messageTextarea.addEventListener('blur', () => this.updateLabel(messageTextarea, messageLabel));
    }

    // Form submission
    contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Initialize form state
    this.updateLabel(emailInput, emailLabel);
    this.updateLabel(messageTextarea, messageLabel);
    this.validateForm();
  }

  /**
   * Update form label animation
   */
  updateLabel(input, label) {
    if (!input || !label) return;
    
    const shouldFloat = input.value.length > 0 || input === document.activeElement;
    label.classList.toggle('floating', shouldFloat);
  }

  /**
   * Validate contact form
   */
  validateForm() {
    const { emailInput, messageTextarea, messageGroup, submitBtn } = this.elements;
    
    if (!emailInput || !messageTextarea) return;
    
    const emailValid = this.isValidEmail(emailInput.value.trim());
    const messageValid = messageTextarea.value.trim().length > 0;
    
    // Show/hide message group
    messageGroup?.classList.toggle('visible', emailValid);
    submitBtn?.classList.toggle('moved-down', emailValid);
    
    // Enable/disable submit button
    if (submitBtn) {
      submitBtn.disabled = !(emailValid && messageValid);
    }
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    
    const { contactForm, submitBtn, successMessage } = this.elements;
    const formData = new FormData(contactForm);
    const email = formData.get('email');
    const message = formData.get('message');
    
    if (!this.isValidEmail(email) || !message.trim()) return;
    
    this.setSubmitButtonState('loading');
    
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        this.handleFormSuccess();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.handleFormError();
    } finally {
      setTimeout(() => {
        this.setSubmitButtonState('normal');
      }, 1000);
    }
  }

  /**
   * Handle successful form submission
   */
  handleFormSuccess() {
    const { contactForm, successMessage, emailLabel, messageLabel, messageGroup, submitBtn } = this.elements;
    
    // Show success message
    successMessage?.classList.add('visible');
    
    // Reset form
    contactForm.reset();
    messageGroup?.classList.remove('visible');
    submitBtn?.classList.remove('moved-down');
    
    // Reset labels
    emailLabel?.classList.remove('floating');
    messageLabel?.classList.remove('floating');
    
    // Revalidate form
    this.validateForm();
    
    // Hide success message after delay
    setTimeout(() => {
      successMessage?.classList.remove('visible');
    }, this.config.successMessageDuration);
  }

  /**
   * Handle form submission error
   */
  handleFormError() {
    const { submitBtn } = this.elements;
    
    if (!submitBtn) return;
    
    submitBtn.textContent = 'ERROR - TRY AGAIN';
    submitBtn.style.color = '#d32f2f';
    submitBtn.style.borderColor = '#d32f2f';
    
    setTimeout(() => {
      submitBtn.textContent = 'SEND';
      submitBtn.style.color = '#111';
      submitBtn.style.borderColor = '#111';
    }, this.config.errorMessageDuration);
  }

  /**
   * Set submit button state
   */
  setSubmitButtonState(state) {
    const { submitBtn } = this.elements;
    
    if (!submitBtn) return;
    
    switch (state) {
      case 'loading':
        submitBtn.disabled = true;
        submitBtn.textContent = 'SENDING...';
        break;
      case 'normal':
        submitBtn.disabled = false;
        if (submitBtn.textContent === 'SENDING...') {
          submitBtn.textContent = 'SEND';
        }
        break;
    }
  }

  /**
   * Bind additional events
   */
  bindEvents() {
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Only handle arrow keys if not in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousProject();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextProject();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.state.currentSection > 0) {
          this.smoothScrollToSection(this.state.currentSection - 1, this.config.keyboardScrollDuration);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.state.currentSection < this.elements.sections.length - 1) {
          this.smoothScrollToSection(this.state.currentSection + 1, this.config.keyboardScrollDuration);
        }
      }
    });

    // Handle visibility change (pause auto-slide when tab is not active)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoSlide();
      } else {
        this.startAutoSlide();
      }
    });
  }

  /**
   * Scroll to specific section (for navigation clicks)
   */
  scrollToSection(index) {
    this.smoothScrollToSection(index);
  }

  /**
   * Update active navigation indicator
   */
  updateActiveNavigation() {
    const { navLinks } = this.elements;
    
    navLinks.forEach((link, index) => {
      link.classList.toggle('active', index === this.state.currentSection);
    });
  }

  /**
   * Go to specific project
   */
  goToProject(index) {
    this.state.currentProject = index;
    this.updateSlider();
    this.pauseAutoSlide();
    
    setTimeout(() => {
      this.startAutoSlide();
    }, this.config.interactionPause);
  }

  /**
   * Go to next project
   */
  nextProject() {
    const totalProjects = this.elements.projects.length;
    this.state.currentProject = (this.state.currentProject + 1) % totalProjects;
    this.updateSlider();
    this.pauseAutoSlide();
    
    setTimeout(() => {
      this.startAutoSlide();
    }, this.config.interactionPause);
  }

  /**
   * Go to previous project
   */
  previousProject() {
    const totalProjects = this.elements.projects.length;
    this.state.currentProject = this.state.currentProject === 0 
      ? totalProjects - 1 
      : this.state.currentProject - 1;
    this.updateSlider();
    this.pauseAutoSlide();
    
    setTimeout(() => {
      this.startAutoSlide();
    }, this.config.interactionPause);
  }

  /**
   * Update slider position and indicators
   */
  updateSlider() {
    const { slider, projects } = this.elements;
    const totalProjects = projects.length;
    
    if (!slider || totalProjects === 0) return;
    
    // Calculate and apply offset
    const offset = -(this.state.currentProject * (100 / totalProjects));
    slider.style.transform = `translateX(${offset}%)`;
    
    // Update indicators
    const indicators = document.querySelectorAll('.project-indicators .line');
    indicators.forEach((indicator, index) => {
      const isActive = index === this.state.currentProject;
      indicator.classList.toggle('active', isActive);
      indicator.setAttribute('aria-selected', isActive.toString());
    });
    
    // Update project cards
    projects.forEach((project, index) => {
      project.classList.toggle('active', index === this.state.currentProject);
    });
  }

  /**
   * Start auto-slide functionality
   */
  startAutoSlide() {
    const totalProjects = this.elements.projects.length;
    
    if (totalProjects <= 1) return;
    
    this.pauseAutoSlide(); // Clear any existing timer
    
    this.state.autoSlideTimer = setInterval(() => {
      this.nextProject();
    }, this.config.autoSlideInterval);
  }

  /**
   * Pause auto-slide functionality
   */
  pauseAutoSlide() {
    if (this.state.autoSlideTimer) {
      clearInterval(this.state.autoSlideTimer);
      this.state.autoSlideTimer = null;
    }
  }

  /**
   * Email validation utility
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Throttle utility for performance optimization
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});

// Handle page visibility changes for better performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause any heavy operations when tab is not visible
    document.dispatchEvent(new CustomEvent('pauseAnimations'));
  } else {
    // Resume operations when tab becomes visible
    document.dispatchEvent(new CustomEvent('resumeAnimations'));
  }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioApp;
}