const container = document.getElementById('container');
const navLinks = document.querySelectorAll('.dot-nav a');
const sections = [...document.querySelectorAll('section')];

// Navigation functionality
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
const emailLabel = emailInput.nextElementSibling;
const messageTextarea = document.querySelector('textarea[name="message"]');
const messageLabel = messageTextarea.nextElementSibling;
const messageGroup = document.querySelector('.message-group');
const submitBtn = document.querySelector('.submit-btn');
const contactForm = document.querySelector('.contact-form');
const successMessage = document.querySelector('.success-message');

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Label animation - fixed to work properly
function updateLabel(input, label) {
  if (input.value.length > 0 || input === document.activeElement) {
    label.classList.add('floating');
  } else {
    label.classList.remove('floating');
  }
}

// Form validation and animation sequence
function validateForm() {
  const emailValid = isValidEmail(emailInput.value.trim());
  const messageValid = messageTextarea.value.trim().length > 0;
  
  // Show message field only when email is valid
  if (emailValid) {
    messageGroup.classList.add('visible');
    submitBtn.classList.add('moved-down');
  } else {
    messageGroup.classList.remove('visible');
    submitBtn.classList.remove('moved-down');
  }
  
  // Enable submit button only when both email and message are valid
  submitBtn.disabled = !(emailValid && messageValid);
}

// Event listeners for form inputs
emailInput.addEventListener('input', () => {
  updateLabel(emailInput, emailLabel);
  validateForm();
});

emailInput.addEventListener('focus', () => {
  updateLabel(emailInput, emailLabel);
});

emailInput.addEventListener('blur', () => {
  updateLabel(emailInput, emailLabel);
});

messageTextarea.addEventListener('input', () => {
  updateLabel(messageTextarea, messageLabel);
  validateForm();
});

messageTextarea.addEventListener('focus', () => {
  updateLabel(messageTextarea, messageLabel);
});

messageTextarea.addEventListener('blur', () => {
  updateLabel(messageTextarea, messageLabel);
});

// Initialize form state
updateLabel(emailInput, emailLabel);
updateLabel(messageTextarea, messageLabel);
validateForm();

// Form submission with proper success handling
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(contactForm);
  const email = formData.get('email');
  const message = formData.get('message');
  
  // Double-check validation
  if (!isValidEmail(email) || !message.trim()) {
    return;
  }
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'SENDING...';
  
  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: { 
        'Accept': 'application/json' 
      },
    });
    
    if (response.ok) {
      // Success: show message and reset form
      successMessage.classList.add('visible');
      
      // Reset form and animations
      contactForm.reset();
      messageGroup.classList.remove('visible');
      submitBtn.classList.remove('moved-down');
      
      // Reset labels
      updateLabel(emailInput, emailLabel);
      updateLabel(messageTextarea, messageLabel);
      validateForm();
      
      // Hide success message after 4 seconds
      setTimeout(() => {
        successMessage.classList.remove('visible');
      }, 4000);
      
    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    console.error('Error:', error);
    
    // Show error in a minimalistic way
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'ERROR - TRY AGAIN';
    submitBtn.style.color = '#d32f2f';
    submitBtn.style.borderColor = '#d32f2f';
    
    setTimeout(() => {
      submitBtn.textContent = 'SEND';
      submitBtn.style.color = '#111';
      submitBtn.style.borderColor = '#111';
    }, 3000);
  } finally {
    // Reset button state
    setTimeout(() => {
      submitBtn.disabled = false;
      if (submitBtn.textContent === 'SENDING...') {
        submitBtn.textContent = 'SEND';
      }
    }, 1000);
  }
});