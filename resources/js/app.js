import './production.js';

// Simple Image Slider
document.addEventListener('DOMContentLoaded', function() {
    const rotator = document.getElementById('rotator');
    if (!rotator) {
        console.log('Rotator not found');
        return;
    }

    const slides = rotator.querySelectorAll('.slideshowImageWrapper');
    const backBtn = document.getElementById('backBtn');
    const fwdBtn = document.getElementById('fwdBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const shortcuts = document.querySelectorAll('[id^="rotatorShortcut"]');

    console.log('Slider initialized with', slides.length, 'slides');

    let currentIndex = 0; // Start at index 0 (first slide)
    let autoPlayInterval;
    let isPlaying = true;

    function updateSlide(index) {
        console.log('Updating to slide', index);
        // Remove active/visible from all slides
        slides.forEach(slide => {
            slide.classList.remove('active', 'visible');
            slide.style.zIndex = '105';
        });

        // Add active/visible to current slide
        slides[index].classList.add('active', 'visible');
        slides[index].style.zIndex = '110';

        // Update shortcuts
        shortcuts.forEach((shortcut, i) => {
            shortcut.classList.toggle('shortcutCurrent', i === index);
        });

        currentIndex = index;
    }

    function nextSlide() {
        const nextIndex = (currentIndex + 1) % slides.length;
        updateSlide(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlide(prevIndex);
    }

    function startAutoPlay() {
        isPlaying = true;
        pauseBtn.classList.add('rotatorPause');
        autoPlayInterval = setInterval(nextSlide, 8000);
        console.log('Auto play started');
    }

    function stopAutoPlay() {
        isPlaying = false;
        pauseBtn.classList.remove('rotatorPause');
        clearInterval(autoPlayInterval);
        console.log('Auto play stopped');
    }

    function toggleAutoPlay() {
        if (isPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    }

    // Event listeners
    if (backBtn) backBtn.addEventListener('click', prevSlide);
    if (fwdBtn) fwdBtn.addEventListener('click', nextSlide);
    if (pauseBtn) pauseBtn.addEventListener('click', toggleAutoPlay);

    // Shortcut buttons
    shortcuts.forEach((shortcut, index) => {
        shortcut.addEventListener('click', () => updateSlide(index));
    });

    // Start auto play
    startAutoPlay();
});