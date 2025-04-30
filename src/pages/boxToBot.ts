import img1 from './images/boxToBot/1.png';
import img2 from './images/boxToBot/2.png';
import img3 from './images/boxToBot/3.png';
import img4 from './images/boxToBot/4.png';
import img5 from './images/boxToBot/5.png';

const images = [img1, img2, img3, img4, img5];

const steps = document.getElementsByClassName("step");
const image = document.getElementsByClassName("boxToBotImg")[0] as HTMLImageElement;
var existingImgState = -1;

function updateBoxToBot() {
    let imgState = 0;

    for (let step of steps) {
        let viewportOffset = step.getBoundingClientRect();
        
        if ((viewportOffset.top + viewportOffset.bottom)/2 > window.innerHeight / 2) break;

        imgState += 1;
    }
    
    if (imgState != existingImgState) {
        image.src = images[imgState];

        if (existingImgState != -1) {
            image.classList.remove("scale-animate");
            void image.offsetWidth;
            image.classList.add("scale-animate");
        }

        existingImgState = imgState;
    }
}

document.addEventListener("scroll", updateBoxToBot);