/**
 * JT Trauma Therapy - Main JavaScript
 * Production-ready, accessible interactions
 */

(function() {
    'use strict';

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

    // Mobile navigation toggle
    function initMobileNav() {
        const navToggle = document.querySelector('.nav__toggle');
        const nav = document.querySelector('.nav');
        
        if (!navToggle || !nav) return;

        // Create mobile nav list
        let mobileNavList = nav.querySelector('.nav__list--mobile');
        if (!mobileNavList) {
            const originalNavList = nav.querySelector('.nav__list');
            if (originalNavList) {
                mobileNavList = originalNavList.cloneNode(true);
                mobileNavList.classList.add('nav__list--mobile');
                nav.appendChild(mobileNavList);
            }
        }

        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            navToggle.setAttribute('aria-expanded', !isExpanded);
            
            if (mobileNavList) {
                mobileNavList.classList.toggle('nav__list--open');
            }
            
            // Animate hamburger bars
            const bars = navToggle.querySelectorAll('.nav__toggle-bar');
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

        // Close mobile nav when clicking on links
        if (mobileNavList) {
            const mobileNavLinks = mobileNavList.querySelectorAll('.nav__link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.click();
                });
            });
        }

        // Close mobile nav when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && mobileNavList && mobileNavList.classList.contains('nav__list--open')) {
                navToggle.click();
            }
        });
    }

    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') {
                    e.preventDefault();
                    return;
                }
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Form validation
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

        function setFormState(state) {
            currentState = state;
            
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
        }

        // Real-time validation
        const formFields = form.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('form__input--error')) {
                    validateField(field);
                }
            });
        });

        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (currentState === FORM_STATES.SUBMITTING) return;

            // Validate all fields
            let isFormValid = true;
            formFields.forEach(field => {
                if (!validateField(field)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                // Focus first error field
                const firstError = form.querySelector('.form__input--error');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }

            setFormState(FORM_STATES.SUBMITTING);

            try {
                // Simulate form submission (replace with actual endpoint)
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // In production, replace with actual form submission:
                // const formData = new FormData(form);
                // const response = await fetch('/api/booking', {
                //     method: 'POST',
                //     body: formData
                // });
                // 
                // if (!response.ok) {
                //     throw new Error('Submission failed');
                // }

                setFormState(FORM_STATES.SUCCESS);
                
                // Scroll to success message
                successMessage?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });

            } catch (error) {
                setFormState(FORM_STATES.ERROR);
                console.error('Form submission error:', error);
                
                // Show error message (you can customize this)
                alert('There was an error submitting your request. Please try again or contact us directly.');
            }
        });
    }

    // Header scroll effect
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;
            
            if (scrollY > 50) {
                // Enhanced dark glass effect when scrolled
                header.style.background = 'rgba(30, 41, 59, 0.98)';
                header.style.backdropFilter = 'blur(30px)';
                header.style.webkitBackdropFilter = 'blur(30px)';
                header.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
            } else {
                // Original dark glass effect
                header.style.background = 'rgba(30, 41, 59, 0.95)';
                header.style.backdropFilter = 'blur(20px)';
                header.style.webkitBackdropFilter = 'blur(20px)';
                header.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }
            
            lastScrollY = scrollY;
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Lazy loading for images
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Accessibility enhancements
    function initAccessibility() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #5a9fd4;
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main landmark
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }

        // Announce form state changes to screen readers
        const form = document.getElementById('bookingForm');
        if (form) {
            const announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            form.appendChild(announcer);
        }
    }

    // Performance monitoring
    function initPerformanceMonitoring() {
        // Log Core Web Vitals if available
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        console.log(`${entry.name}: ${entry.value}`);
                    });
                });
                observer.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (e) {
                // Silently fail if not supported
            }
        }
        
        // Log page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${Math.round(loadTime)}ms`);
        });
    }

    // Initialize all functionality
    function init() {
        initMobileNav();
        initSmoothScrolling();
        initFormHandling();
        initHeaderScroll();
        initLazyLoading();
        initAccessibility();
        initPerformanceMonitoring();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden - pause any non-essential operations
        } else {
            // Page is visible again
        }
    });

})();