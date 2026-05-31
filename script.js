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

    // --- Dynamic Gallery & Modal Logic --- //
    const galleryContainer = document.getElementById('project-gallery');
    const projectModal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalIndicators = document.getElementById('modal-indicators');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');
    
    let currentProjectIndex = null;
    let currentImageIndex = 0;
    
    // Zoom and pan variables
    let zoomScale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;

    function applyTransform() {
        modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
    }

    function resetZoom() {
        zoomScale = 1;
        translateX = 0;
        translateY = 0;
        modalImage.style.transition = 'transform 0.3s ease';
        applyTransform();
        // Remove transition after it's done so dragging is smooth
        setTimeout(() => {
            modalImage.style.transition = 'none';
        }, 300);
    }
    if (galleryContainer && typeof projectsData !== 'undefined') {
        projectsData.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'card fade-in';
            card.dataset.index = index;
            
            // Build the cycling images container
            let imagesHTML = '';
            project.images.forEach((imgSrc, i) => {
                imagesHTML += `<img src="${imgSrc}" class="${i === 0 ? 'active' : ''}" alt="${project.title.en}">`;
            });

            card.innerHTML = `
                <div class="card-image" id="card-img-container-${index}">
                    ${imagesHTML}
                </div>
                <div class="card-info">
                    <h3 data-en="${project.title.en}" data-es="${project.title.es}" data-de="${project.title.de}">${project.title[savedLang] || project.title.en}</h3>
                    <p data-en="${project.description.en}" data-es="${project.description.es}" data-de="${project.description.de}">${project.description[savedLang] || project.description.en}</p>
                </div>
            `;
            
            // Click to open modal
            card.addEventListener('click', () => openModal(index));
            galleryContainer.appendChild(card);
            
            // Setup automatic cycling
            const imgContainer = card.querySelector('.card-image');
            const imgs = imgContainer.querySelectorAll('img');
            if (imgs.length > 1) {
                let currentIdx = 0;
                setInterval(() => {
                    imgs[currentIdx].classList.remove('active');
                    currentIdx = (currentIdx + 1) % imgs.length;
                    imgs[currentIdx].classList.add('active');
                }, 3000 + (Math.random() * 2000)); // random offset
            }
            
            // Observe the new elements to apply fade-in
            observer.observe(card);
        });
        
        // Modal functions
        function openModal(projectIndex) {
            currentProjectIndex = projectIndex;
            currentImageIndex = 0;
            updateModalContent();
            projectModal.classList.remove('hidden');
        }
        
        function updateModalContent() {
            const project = projectsData[currentProjectIndex];
            const lang = localStorage.getItem('santos_lang') || 'en';
            
            modalImage.src = project.images[currentImageIndex];
            resetZoom();
            modalTitle.innerText = project.title[lang] || project.title.en;
            modalTitle.setAttribute('data-en', project.title.en);
            modalTitle.setAttribute('data-es', project.title.es);
            modalTitle.setAttribute('data-de', project.title.de);
            
            modalDescription.innerText = project.description[lang] || project.description.en;
            modalDescription.setAttribute('data-en', project.description.en);
            modalDescription.setAttribute('data-es', project.description.es);
            modalDescription.setAttribute('data-de', project.description.de);
            
            // Update indicators
            modalIndicators.innerHTML = '';
            project.images.forEach((_, idx) => {
                const ind = document.createElement('div');
                ind.className = `indicator ${idx === currentImageIndex ? 'active' : ''}`;
                ind.addEventListener('click', () => {
                    currentImageIndex = idx;
                    updateModalContent();
                });
                modalIndicators.appendChild(ind);
            });
        }
        
        modalNext.addEventListener('click', () => {
            const project = projectsData[currentProjectIndex];
            currentImageIndex = (currentImageIndex + 1) % project.images.length;
            updateModalContent();
        });
        
        modalPrev.addEventListener('click', () => {
            const project = projectsData[currentProjectIndex];
            currentImageIndex = (currentImageIndex - 1 + project.images.length) % project.images.length;
            updateModalContent();
        });
        
        // Keyboard navigation for modal
        document.addEventListener('keydown', (e) => {
            if (!projectModal.classList.contains('hidden') && currentProjectIndex !== null) {
                const project = projectsData[currentProjectIndex];
                if (e.key === 'ArrowRight') {
                    currentImageIndex = (currentImageIndex + 1) % project.images.length;
                    updateModalContent();
                } else if (e.key === 'ArrowLeft') {
                    currentImageIndex = (currentImageIndex - 1 + project.images.length) % project.images.length;
                    updateModalContent();
                } else if (e.key === 'Escape') {
                    projectModal.classList.add('hidden');
                }
            }
        });
        
        modalCloseBtn.addEventListener('click', () => {
            projectModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside content
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                projectModal.classList.add('hidden');
            }
        });

        // --- Zoom and Pan Logic --- //
        const imageContainer = document.querySelector('.modal-image-container');
        
        imageContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomAmount = 0.1;
            if (e.deltaY < 0) {
                // Zoom in
                zoomScale = Math.min(zoomScale + zoomAmount, 5); // Max zoom 5x
            } else {
                // Zoom out
                zoomScale = Math.max(zoomScale - zoomAmount, 1); // Min zoom 1x
            }
            
            if (zoomScale === 1) {
                translateX = 0;
                translateY = 0;
            }
            applyTransform();
        });

        imageContainer.addEventListener('mousedown', (e) => {
            if (zoomScale > 1) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                imageContainer.style.cursor = 'grabbing';
            }
        });

        imageContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            applyTransform();
        });

        const stopDragging = () => {
            isDragging = false;
            imageContainer.style.cursor = zoomScale > 1 ? 'grab' : 'default';
        };

        imageContainer.addEventListener('mouseup', stopDragging);
        imageContainer.addEventListener('mouseleave', stopDragging);
        
        // Update cursor based on zoom
        imageContainer.addEventListener('mousemove', () => {
            if (!isDragging) {
                imageContainer.style.cursor = zoomScale > 1 ? 'grab' : 'default';
            }
        });
    }
});