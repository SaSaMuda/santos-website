// Esperar a que el documento cargue
document.addEventListener("DOMContentLoaded", () => {

    // Animación Fade-in al hacer scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Dark mode toggle logic
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.setAttribute('data-feather', 'sun');
            } else {
                icon.setAttribute('data-feather', 'moon');
            }
            // Ensure Feather icons updates the replaced icon
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        });
    }
});