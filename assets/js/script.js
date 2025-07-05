// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Navigation functionality
  const container = document.getElementById('container');
  const navLinks = document.querySelectorAll('.dot-nav a');
  const sections = [...document.querySelectorAll('section')];

  navLinks.forEach((link, i) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      sections[i].scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Active navigation indicator
  container.addEventListener('scroll', () => {
    const scrollPos = container.scrollTop;
    const height = container.clientHeight;
    sections.forEach((section, i) => {
      if (
        scrollPos >= section.offsetTop - height / 2 &&
        scrollPos < section.offsetTop + height / 2
      ) {
        navLinks.forEach((link) => link.classList.remove('active'));
        navLinks[i].classList.add('active');
      }
    });
  });

  // Form elements
  const emailInput = document.querySelector('input[name="email"]');
  const emailLabel = emailInput ? emailInput.nextElementSibling : null;
  const messageTextarea = document.querySelector('textarea[name="message"]');
  const messageLabel = messageTextarea ? messageTextarea.nextElementSibling : null;
  const messageGroup = document.querySelector('.message-group');
  const submitBtn = document.querySelector('.submit-btn');
  const contactForm = document.querySelector('.contact-form');
  const successMessage = document.querySelector('.success-message');

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Label animation
  function updateLabel(input, label) {
    if (!input || !label) return;
    if (input.value.length > 0 || input === document.activeElement) {
      label.classList.add('floating');
    } else {
      label.classList.remove('floating');
    }
  }

  // Form validation and animation sequence
  function validateForm() {
    if (!emailInput || !messageTextarea) return;
    
    const emailValid = isValidEmail(emailInput.value.trim());
    const messageValid = messageTextarea.value.trim().length > 0;
    
    if (emailValid && messageGroup) {
      messageGroup.classList.add('visible');
      if (submitBtn) submitBtn.classList.add('moved-down');
    } else {
      if (messageGroup) messageGroup.classList.remove('visible');
      if (submitBtn) submitBtn.classList.remove('moved-down');
    }
    
    if (submitBtn) {
      submitBtn.disabled = !(emailValid && messageValid);
    }
  }

  // Form event listeners
  if (emailInput && emailLabel) {
    emailInput.addEventListener('input', () => {
      updateLabel(emailInput, emailLabel);
      validateForm();
    });
    emailInput.addEventListener('focus', () => updateLabel(emailInput, emailLabel));
    emailInput.addEventListener('blur', () => updateLabel(emailInput, emailLabel));
  }

  if (messageTextarea && messageLabel) {
    messageTextarea.addEventListener('input', () => {
      updateLabel(messageTextarea, messageLabel);
      validateForm();
    });
    messageTextarea.addEventListener('focus', () => updateLabel(messageTextarea, messageLabel));
    messageTextarea.addEventListener('blur', () => updateLabel(messageTextarea, messageLabel));
  }

  // Initialize form state
  if (emailInput && emailLabel) updateLabel(emailInput, emailLabel);
  if (messageTextarea && messageLabel) updateLabel(messageTextarea, messageLabel);
  validateForm();

  // Form submission
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const email = formData.get('email');
      const message = formData.get('message');
      
      if (!isValidEmail(email) || !message.trim()) return;
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'SENDING...';
      }
      
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });
        
        if (response.ok) {
          if (successMessage) successMessage.classList.add('visible');
          contactForm.reset();
          if (messageGroup) messageGroup.classList.remove('visible');
          if (submitBtn) submitBtn.classList.remove('moved-down');
          
          if (emailInput && emailLabel) updateLabel(emailInput, emailLabel);
          if (messageTextarea && messageLabel) updateLabel(messageTextarea, messageLabel);
          validateForm();
          
          setTimeout(() => {
            if (successMessage) successMessage.classList.remove('visible');
          }, 4000);
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        console.error('Error:', error);
        if (submitBtn) {
          submitBtn.textContent = 'ERROR - TRY AGAIN';
          submitBtn.style.color = '#d32f2f';
          submitBtn.style.borderColor = '#d32f2f';
          
          setTimeout(() => {
            submitBtn.textContent = 'SEND';
            submitBtn.style.color = '#111';
            submitBtn.style.borderColor = '#111';
          }, 3000);
        }
      } finally {
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            if (submitBtn.textContent === 'SENDING...') {
              submitBtn.textContent = 'SEND';
            }
          }
        }, 1000);
      }
    });
  }

  // PROJECT SLIDER
  const slider = document.querySelector('.projects-slider');
  const projects = document.querySelectorAll('.project-card');
  const indicatorsContainer = document.querySelector('.project-indicators');
  
  console.log('Slider elements:', { slider, projects: projects.length, indicatorsContainer });
  
  if (slider && projects.length > 0) {
    let currentProject = 0;
    const totalProjects = projects.length;

    // Initialize the first project as active immediately
    projects[0].classList.add('active');

    if (totalProjects > 1) {
      initializeSlider();
    } else {
      if (indicatorsContainer) {
        indicatorsContainer.style.display = 'none';
      }
    }

    function initializeSlider() {
      createIndicators();
      updateSlider(); // Call this immediately to set initial state
      
      setTimeout(() => {
        if (indicatorsContainer) {
          indicatorsContainer.classList.add('visible');
        }
      }, 500);
      
      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      slider.addEventListener('touchstart', handleStart, { passive: true });
      slider.addEventListener('touchmove', handleMove, { passive: true });
      slider.addEventListener('touchend', handleEnd, { passive: true });
      slider.addEventListener('mousedown', handleStart);
      slider.addEventListener('mousemove', handleMove);
      slider.addEventListener('mouseup', handleEnd);
      slider.addEventListener('mouseleave', handleEnd);

      function handleStart(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
      }

      function handleMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        currentX = (e.type === 'mousemove' ? e.clientX : e.touches[0].clientX) - startX;
      }

      function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        const threshold = 50;
        if (currentX > threshold && currentProject > 0) {
          currentProject--;
        } else if (currentX < -threshold && currentProject < totalProjects - 1) {
          currentProject++;
        }
        
        updateSlider();
        currentX = 0;
      }

      setInterval(() => {
        currentProject = (currentProject + 1) % totalProjects;
        updateSlider();
      }, 5000);
    }

    function createIndicators() {
      if (!indicatorsContainer) return;
      
      indicatorsContainer.innerHTML = ''; // Clear existing
      
      for (let i = 0; i < totalProjects; i++) {
        const line = document.createElement('div');
        line.classList.add('line');
        if (i === 0) line.classList.add('active');
        
        line.addEventListener('click', () => {
          currentProject = i;
          updateSlider();
        });
        
        indicatorsContainer.appendChild(line);
      }
    }

    function updateSlider() {
      const offset = -currentProject * 100;
      slider.style.transform = `translateX(${offset}%)`;
      
      // Update line indicators
      const lines = document.querySelectorAll('.project-indicators .line');
      lines.forEach((line, index) => {
        line.classList.toggle('active', index === currentProject);
      });
      
      // Update active project card
      projects.forEach((project, index) => {
        project.classList.toggle('active', index === currentProject);
      });
    }
  } else {
    console.log('Slider not found or no projects');
  }
}); // Closes the DOMContentLoaded event listener