// import img1 from './images/boxToBot/1.png';
// import img2 from './images/boxToBot/2.png';
// import img3 from './images/boxToBot/3.png';
// import img4 from './images/boxToBot/4.png';
// import img5 from './images/boxToBot/5.png';

// const images = [img1, img2, img3, img4, img5];

const steps = document.querySelectorAll(".steps > p");
const image = document.getElementsByClassName("boxToBotImg")[0] as HTMLImageElement;
var existingImgState = 0;

const popAnim = [
    { transform: "rotate(0) scale(1)" },
    { transform: "rotate(360deg) scale(0)" },
];

const popTiming = {
    duration: 200,
    iterations: 1,
};

document.onscroll = (e) => {
    let imgState = 0;

    for (let step of steps) {
        let viewportOffset = step.getBoundingClientRect();
        
        if (viewportOffset.top > window.innerHeight / 2) {
            break;
        }

        imgState += 1;
    }
    
    if (imgState != existingImgState) {
        existingImgState = imgState;
        // image.src = images[imgState];
        image.classList.remove("scale-animate");
        void image.offsetWidth;
        image.classList.add("scale-animate");
    }
}