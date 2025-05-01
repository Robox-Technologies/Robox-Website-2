import img1 from './images/boxToBot/1.png';
import img2 from './images/boxToBot/2.png';
import img3 from './images/boxToBot/3.png';
import img4 from './images/boxToBot/4.png';
import img5 from './images/boxToBot/5.png';

const images = [img1, img2, img3, img4, img5];

const steps = document.getElementsByClassName("step");
const image = document.getElementsByClassName("boxToBotImg")[0] as HTMLImageElement;
let currentImgIndex = -1;

function updateBoxToBot() {
    let imgIndex = 0;

    for (let step of steps) {
        let viewportOffset = step.getBoundingClientRect();
        
        if ((viewportOffset.top + viewportOffset.bottom)/2 > window.innerHeight / 2) break;

        imgIndex += 1;
    }
    
    if (imgIndex != currentImgIndex) {
        image.src = images[imgIndex];

        if (currentImgIndex != -1) {
            image.classList.remove("scale-animate");
            void image.offsetWidth;
            image.classList.add("scale-animate");
        }

        currentImgIndex = imgIndex;
    }
}

document.addEventListener("scroll", updateBoxToBot);