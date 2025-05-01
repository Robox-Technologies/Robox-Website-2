import hamburgerIcon from '@images/hamburger.json';

const hamburger = document.querySelector('.hamburger') as HTMLButtonElement;
const hamburgerMenu = document.querySelector('.hamburgerMenu') as HTMLElement;
const hamburgerLottie = document.createElement("lottie-player");

let hamburgerMenuOpened = false;

hamburgerLottie.setAttribute('src', hamburgerIcon);
hamburgerLottie.setAttribute('background', 'transparent');
hamburgerLottie.setAttribute('direction', '-1');
hamburger.appendChild(hamburgerLottie);

hamburger.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    hamburgerMenuOpened = !hamburgerMenuOpened;

    updateHamburger();
});

function updateHamburger() {
    if (hamburgerMenuOpened) {
        hamburgerMenu.classList.add('active');
        hamburgerMenu.style.top = '56px';
    } else {
        hamburgerMenu.classList.remove('active');
        hamburgerMenu.style.top = '';
    }

    // Animate icon
    let lottiePlayer = hamburgerLottie as LottiePlayer;
    lottiePlayer.setDirection(hamburgerMenuOpened ? 1 : -1);
    lottiePlayer.play();
}