(() => {
    const eyes = Array.from(document.getElementsByClassName("eyes")).map(eye => eye as HTMLElement);
    const eyeMaxDist = 5;
    const falloffFac = 200;
    
    var mousePos: {x: number, y: number} | undefined = undefined;
    function updateEyes(event: Event) {
        let mouseEvent = event as MouseEvent;

        if (mouseEvent.clientX != undefined && mouseEvent.clientY != undefined) {
            mousePos = {x: mouseEvent.clientX, y: mouseEvent.clientY};
        } else if (mousePos == undefined) {
            return;
        }

        eyes.forEach(eye => {
            let rootRect = eye.getBoundingClientRect();
            let rootPos = {x:rootRect.x+rootRect.width/2,y:rootRect.y+rootRect.height/2};

            if (rootRect.top > window.innerHeight || rootRect.bottom < 0) return;
            if (mousePos == undefined) return;

            let delta = {
                x: mousePos.x - rootPos.x,
                y: mousePos.y - rootPos.y
            };

            let dist = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
            let deltaNorm = {x:delta.x/dist,y:delta.y/dist};
            let asymptoticDist = -falloffFac/(dist + falloffFac/eyeMaxDist) + eyeMaxDist;
            
            eye.style.transform = `translate(${deltaNorm.x*asymptoticDist}%,${deltaNorm.y*asymptoticDist}%)`;
        });
    }

    document.addEventListener("scroll", updateEyes);
    document.addEventListener("mousemove", updateEyes);
})();