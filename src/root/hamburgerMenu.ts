import hamburgerIcon from '@images/hamburger.json';

const headerHeight = '56px';

const hamburger = document.querySelector('.hamburger') as HTMLButtonElement;
const hamburgerMenu = document.querySelector('.hamburgerMenu') as HTMLElement;
const hamburgerLottie = document.createElement("lottie-player");

let hamburgerMenuOpened = false;
let displayTimeoutID: NodeJS.Timeout | undefined = undefined;

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
    clearTimeout(displayTimeoutID);

    if (hamburgerMenuOpened) {
        hamburgerMenu.style.display = 'flex';

        displayTimeoutID = setTimeout(() => {
            hamburgerMenu.style.top = headerHeight;
        }, 1);
    } else {
        hamburgerMenu.style.top = '';

        displayTimeoutID = setTimeout(() => {
            hamburgerMenu.style.display = 'none';
        }, 500);
    }

    // Animate icon
    let lottiePlayer = hamburgerLottie as LottiePlayer;
    lottiePlayer.setDirection(hamburgerMenuOpened ? 1 : -1);
    lottiePlayer.play();
}