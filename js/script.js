/**
 * CoolPicsUK - Main JavaScript
 * Handles navigation, smooth scrolling, carousel, form validation, and interactive features
 */

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// NAVIGATION
// ========================================

class Navigation {
    constructor() {
        this.nav = document.getElementById('navigation');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');

        this.init();
    }

    init() {
        // Sticky navigation on scroll
        window.addEventListener('scroll', debounce(() => this.handleScroll(), 10));

        // Hamburger menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        // Smooth scroll for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Update active link on scroll
        window.addEventListener('scroll', debounce(() => this.updateActiveLink(), 100));
    }

    handleScroll() {
        if (window.scrollY > 100) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
    }

    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');

        // Update ARIA attribute
        const isExpanded = this.hamburger.classList.contains('active');
        this.hamburger.setAttribute('aria-expanded', isExpanded);
    }

    handleLinkClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const navHeight = this.nav.offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu after click
            if (this.navMenu.classList.contains('active')) {
                this.toggleMenu();
            }
        }
    }

    handleOutsideClick(e) {
        if (!this.nav.contains(e.target) && this.navMenu.classList.contains('active')) {
            this.toggleMenu();
        }
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('.section');
        const navHeight = this.nav.offsetHeight;

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// ========================================
// TESTIMONIAL CAROUSEL
// ========================================

class TestimonialCarousel {
    constructor() {
        this.track = document.querySelector('.testimonial-track');
        this.cards = document.querySelectorAll('.testimonial-card');
        this.prevBtn = document.querySelector('.carousel-btn-prev');
        this.nextBtn = document.querySelector('.carousel-btn-next');
        this.indicators = document.querySelectorAll('.indicator');

        this.currentIndex = 0;
        this.autoplayInterval = null;

        if (this.track && this.cards.length > 0) {
            this.init();
        }
    }

    init() {
        // Button click handlers
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Indicator click handlers
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Touch/swipe support
        this.setupTouchEvents();

        // Auto-play
        this.startAutoplay();

        // Pause autoplay on hover
        const carousel = document.getElementById('testimonialCarousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.stopAutoplay());
            carousel.addEventListener('mouseleave', () => this.startAutoplay());
        }
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.updateCarousel();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    setupTouchEvents() {
        let startX = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
        });

        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;

            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }

            isDragging = false;
        });
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => this.next(), 5000);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
}

// ========================================
// PORTFOLIO FILTER
// ========================================

class PortfolioFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.portfolioItems = document.querySelectorAll('.portfolio-item');

        if (this.filterBtns.length > 0) {
            this.init();
        }
    }

    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    handleFilter(e) {
        const filter = e.target.getAttribute('data-filter');

        // Update active button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        // Filter items
        this.portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
}

// ========================================
// CONTACT FORM VALIDATION
// ========================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.formWrapper = document.querySelector('.contact-form-wrapper');
        this.successMessage = document.getElementById('formSuccess');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                // Remove error state when user starts typing
                const formGroup = input.closest('.form-group');
                if (formGroup.classList.contains('error')) {
                    formGroup.classList.remove('error');
                }
            });
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            this.submitForm();
        } else {
            // Scroll to first error
            const firstError = this.form.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        let isValid = true;
        let message = '';

        // Check if required field is empty
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && field.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // Display error
        if (!isValid) {
            formGroup.classList.add('error');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        } else {
            formGroup.classList.remove('error');
        }

        return isValid;
    }

    submitForm() {
        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        console.log('Form submitted with data:', data);

        // Simulate form submission
        // In production, this would be an AJAX call to a backend endpoint
        setTimeout(() => {
            this.showSuccess();
        }, 1000);

        // TODO: Replace with actual form submission
        // Example:
        // fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // })
        // .then(response => response.json())
        // .then(result => this.showSuccess())
        // .catch(error => this.showError(error));
    }

    showSuccess() {
        this.form.style.display = 'none';
        this.successMessage.style.display = 'block';

        // Reset form after 5 seconds
        setTimeout(() => {
            this.form.reset();
            this.form.style.display = 'block';
            this.successMessage.style.display = 'none';
        }, 5000);
    }

    showError(error) {
        alert('There was an error submitting your form. Please try again or contact us directly via email.');
        console.error('Form submission error:', error);
    }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.service-card, .offer-item, .testimonial-card');
        this.init();
    }

    init() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Initially hide elements and set initial transform
        this.elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// ========================================
// IMAGE LAZY LOADING
// ========================================

class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            this.images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            this.images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
}

// ========================================
// INITIALIZE ON DOM READY
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    new Navigation();
    new TestimonialCarousel();
    new PortfolioFilter();
    new ContactForm();
    new ScrollAnimations();
    new LazyLoader();

    console.log('CoolPicsUK website loaded successfully!');
});

// ========================================
// SMOOTH SCROLL POLYFILL (for older browsers)
// ========================================

// Check if smooth scroll is supported
if (!('scrollBehavior' in document.documentElement.style)) {
    // Polyfill smooth scroll for older browsers
    const smoothScrollPolyfill = () => {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    };
    smoothScrollPolyfill();
}
