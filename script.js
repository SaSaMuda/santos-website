document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 2. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active');
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 3. Intersection Observer (Fade-in animations)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));


    // --- New i18n & Theme Logic --- //

    const welcomePopup = document.getElementById('welcome-popup');
    const enterBtn = document.getElementById('enter-btn');
    const popupLangSelect = document.getElementById('popup-lang-select');
    const popupThemeSelect = document.getElementById('popup-theme-select');
    const navLangSelect = document.getElementById('nav-lang-select');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Function to apply a specific language
    function setLanguage(lang) {
        // Update all text elements
        const elements = document.querySelectorAll(`[data-${lang}]`);
        elements.forEach(el => {
            el.innerHTML = el.getAttribute(`data-${lang}`); // use innerHTML for bold tags
        });
        
        // Update placeholders
        const placeholders = document.querySelectorAll(`[data-${lang}-placeholder]`);
        placeholders.forEach(el => {
            el.setAttribute('placeholder', el.getAttribute(`data-${lang}-placeholder`));
        });

        // Sync dropdowns
        if(navLangSelect) navLangSelect.value = lang;
        if(popupLangSelect) popupLangSelect.value = lang;

        localStorage.setItem('santos_lang', lang);
    }

    // Function to apply theme
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        if(popupThemeSelect) popupThemeSelect.value = theme;
        localStorage.setItem('santos_theme', theme);
    }

    // Initialization
    const hasVisited = localStorage.getItem('santos_visited');
    const savedLang = localStorage.getItem('santos_lang') || 'en';
    const savedTheme = localStorage.getItem('santos_theme') || 'light';

    if (!hasVisited && welcomePopup) {
        // Show popup on first visit
        welcomePopup.classList.remove('hidden');
        
        // Dynamic translation of the popup itself while choosing
        if (popupLangSelect) {
            popupLangSelect.addEventListener('change', (e) => {
                setLanguage(e.target.value);
            });
        }
        if (popupThemeSelect) {
            popupThemeSelect.addEventListener('change', (e) => {
                setTheme(e.target.value);
            });
        }

        // Listen for Enter Button
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                const chosenLang = popupLangSelect.value;
                const chosenTheme = popupThemeSelect.value;
                
                setLanguage(chosenLang);
                setTheme(chosenTheme);
                
                localStorage.setItem('santos_visited', 'true');
                welcomePopup.classList.add('hidden');
            });
        }
    } else {
        // Already visited, just apply saved preferences
        if (welcomePopup) welcomePopup.classList.add('hidden');
        setLanguage(savedLang);
        setTheme(savedTheme);
    }

    // Top Navigation Language Select
    if (navLangSelect) {
        navLangSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    // Top Navigation Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            setTheme(isDark ? 'light' : 'dark');
        });
    }
});