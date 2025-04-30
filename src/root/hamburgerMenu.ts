import Lottie from '@lottielab/lottie-player/web';

const hamburger = document.querySelector('.hamburger') as HTMLButtonElement;
const navLinks = document.querySelector('.navLinks') as HTMLElement;
const hamburgerLottie = document.getElementById('hamburgerIconLottie') as Lottie;

var hamburgerMenuOpened = false;

hamburger.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    navLinks.classList.toggle('active');
    
    // Animate hamburger
    hamburgerLottie.direction = hamburgerMenuOpened ? 1 : -1;
    hamburgerLottie.play();
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.navLinks') && !target.closest('.hamburger')) {
        navLinks.classList.remove('active');
        const lines = hamburger.querySelectorAll('.hamburger-line') as NodeListOf<HTMLElement>;
        lines.forEach(line => {
            line.style.transform = '';
            line.style.opacity = '';
        });
    }
});