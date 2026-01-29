/**
 * JT Trauma Therapy - Main JavaScript
 * Production-ready, accessible interactions with Supabase integration
 */

(function() {
    'use strict';

    // Supabase configuration
    const SUPABASE_URL = 'https://tozcjiolexyczaaejhsf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvemNqaW9sZXh5Y3phYWVqaHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODQ4OTMsImV4cCI6MjA4NTI2MDg5M30.WCx3bxksjUFL11CaB0shfWuq9q6n3MLxpMoJ8YhfzoA';
    
    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Form validation patterns
    const VALIDATION_PATTERNS = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        name: /^[a-zA-Z\s'-]{2,50}$/,
        age: /^(?:1[6-9]|[2-9]\d|100)$/
    };

    // Form states
    const FORM_STATES = {
        IDLE: 'idle',
        SUBMITTING: 'submitting',
        SUCCESS: 'success',
        ERROR: 'error'
    };

    // Optimized debounce function
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Throttle function for scroll events
    const throttle = (func, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Mobile navigation toggle
    function initMobileNav() {
        const navToggle = document.querySelector('.nav__toggle');
        const nav = document.querySelector('.nav');
        
        if (!navToggle || !nav) return;

        // Create mobile nav list only when needed
        let mobileNavList = nav.querySelector('.nav__list--mobile');
        
        const createMobileNav = () => {
            if (!mobileNavList) {
                const originalNavList = nav.querySelector('.nav__list');
                if (originalNavList) {
                    mobileNavList = originalNavList.cloneNode(true);
                    mobileNavList.classList.add('nav__list--mobile');
                    nav.appendChild(mobileNavList);
                    
                    // Add event listeners to mobile nav links
                    const mobileNavLinks = mobileNavList.querySelectorAll('.nav__link');
                    mobileNavLinks.forEach(link => {
                        link.addEventListener('click', () => {
                            toggleNav();
                        });
                    });
                }
            }
        };

        const toggleNav = () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            navToggle.setAttribute('aria-expanded', !isExpanded);
            
            if (!mobileNavList) createMobileNav();
            
            if (mobileNavList) {
                mobileNavList.classList.toggle('nav__list--open');
            }
            
            // Animate hamburger bars with transform
            const bars = navToggle.querySelectorAll('.nav__toggle-bar');
            requestAnimationFrame(() => {
                bars.forEach((bar, index) => {
                    if (!isExpanded) {
                        if (index === 0) bar.style.transform = 'rotate(45deg) translate(6px, 6px)';
                        if (index === 1) bar.style.opacity = '0';
                        if (index === 2) bar.style.transform = 'rotate(-45deg) translate(6px, -6px)';
                    } else {
                        bar.style.transform = '';
                        bar.style.opacity = '';
                    }
                });
            });
        };

        navToggle.addEventListener('click', toggleNav);

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && mobileNavList?.classList.contains('nav__list--open')) {
                toggleNav();
            }
        });
    }

    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Optimized form validation
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const errorElement = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        if (errorElement) {
            errorElement.textContent = '';
        }
        field.classList.remove('form__input--error');

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        // Specific field validations
        else if (value) {
            switch (fieldName) {
                case 'fullName':
                    if (!VALIDATION_PATTERNS.name.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid name (2-50 characters, letters only)';
                    }
                    break;
                case 'email':
                    if (!VALIDATION_PATTERNS.email.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'age':
                    const age = parseInt(value);
                    if (!VALIDATION_PATTERNS.age.test(value) || age < 16 || age > 100) {
                        isValid = false;
                        errorMessage = 'Please enter a valid age (16-100)';
                    }
                    break;
                case 'sessionType':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'Please select a session type';
                    }
                    break;
                case 'availability':
                    if (value.length < 5) {
                        isValid = false;
                        errorMessage = 'Please provide more details about your availability';
                    }
                    break;
            }
        }

        // Display error
        if (!isValid) {
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
            field.classList.add('form__input--error');
            field.setAttribute('aria-invalid', 'true');
        } else {
            field.removeAttribute('aria-invalid');
        }

        return isValid;
    }

    // Form submission
    function initFormHandling() {
        const form = document.getElementById('bookingForm');
        const submitButton = form?.querySelector('.form__submit');
        const successMessage = document.getElementById('formSuccess');
        
        if (!form || !submitButton) return;

        let currentState = FORM_STATES.IDLE;

        const setFormState = (state) => {
            currentState = state;
            
            requestAnimationFrame(() => {
                switch (state) {
                    case FORM_STATES.IDLE:
                        submitButton.classList.remove('btn--loading');
                        submitButton.disabled = false;
                        successMessage?.classList.remove('show');
                        break;
                    case FORM_STATES.SUBMITTING:
                        submitButton.classList.add('btn--loading');
                        submitButton.disabled = true;
                        break;
                    case FORM_STATES.SUCCESS:
                        submitButton.classList.remove('btn--loading');
                        submitButton.disabled = false;
                        successMessage?.classList.add('show');
                        form.reset();
                        break;
                    case FORM_STATES.ERROR:
                        submitButton.classList.remove('btn--loading');
                        submitButton.disabled = false;
                        break;
                }
            });
        };

        // Real-time validation with optimized debouncing
        const formFields = form.querySelectorAll('input, select, textarea');
        const debouncedValidation = debounce(validateField, 250);
        
        formFields.forEach(field => {
            field.addEventListener('blur', () => validateField(field), { passive: true });
            field.addEventListener('input', () => {
                if (field.classList.contains('form__input--error')) {
                    debouncedValidation(field);
                }
            }, { passive: true });
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (currentState === FORM_STATES.SUBMITTING) return;

            // Validate all fields
            let isFormValid = true;
            for (const field of formFields) {
                if (!validateField(field)) {
                    isFormValid = false;
                }
            }

            if (!isFormValid) {
                // Focus first error field
                const firstError = form.querySelector('.form__input--error');
                firstError?.focus();
                return;
            }

            setFormState(FORM_STATES.SUBMITTING);

            try {
                // Collect form data
                const formData = new FormData(form);
                const fullName = formData.get('fullName');
                const email = formData.get('email');
                const age = formData.get('age');
                const sessionType = formData.get('sessionType');
                const availability = formData.get('availability');
                const notes = formData.get('notes') || 'None';

                // Create email subject and body
                const subject = `New Booking Request - ${fullName}`;
                const body = `Hello,

I would like to book a therapy session with the following details:

Name: ${fullName}
Email: ${email}
Age: ${age}
Preferred Session Type: ${sessionType}
Availability: ${availability}
Additional Notes: ${notes}

Please contact me to arrange a suitable time.

Thank you,
${fullName}`;

                // Create mailto link
                const mailtoLink = `mailto:rogue6293@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                
                // Open email client
                window.location.href = mailtoLink;
                
                // Show success message after a short delay
                setTimeout(() => {
                    setFormState(FORM_STATES.SUCCESS);
                    
                    // Scroll to success message
                    successMessage?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 500);

            } catch (error) {
                setFormState(FORM_STATES.ERROR);
                console.error('Form submission error:', error);
                alert('There was an error processing your request. Please try again.');
            }
        });
    }

    // Optimized header scroll effect
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.scrollY;
            
            requestAnimationFrame(() => {
                if (scrollY > 100) {
                    header.classList.add('visible');
                    header.style.background = 'rgba(0, 0, 0, 0.95)';
                    header.style.backdropFilter = 'blur(30px)';
                    header.style.webkitBackdropFilter = 'blur(30px)';
                    header.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                } else {
                    header.classList.remove('visible');
                }
                ticking = false;
            });
        };

        const throttledUpdate = throttle(updateHeader, 16); // ~60fps
        window.addEventListener('scroll', throttledUpdate, { passive: true });
    }

    // Lazy loading for images (optimized)
    function initLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => imageObserver.observe(img));
    }

    // Minimal accessibility enhancements
    function initAccessibility() {
        // Add main landmark
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }
    }

    // Dark mode toggle
    function initDarkMode() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            // Save preference
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
        });
    }

    // Initialize with performance optimization
    function init() {
        // Critical functionality first
        initMobileNav();
        initSmoothScrolling();
        initFormHandling();
        initDarkMode();
        
        // Non-critical functionality with idle callback or timeout
        const initNonCritical = () => {
            initHeaderScroll();
            initLazyLoading();
            initAccessibility();
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(initNonCritical, { timeout: 2000 });
        } else {
            setTimeout(initNonCritical, 50);
        }
    }

    // Optimized DOM ready check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

})();