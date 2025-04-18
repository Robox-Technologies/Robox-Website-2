document.addEventListener("DOMContentLoaded", (event) => {
    const projectCards = document.querySelectorAll(".project-card") as NodeListOf<HTMLElement>
    for (const projectCard of projectCards) {
        projectCard.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = projectCard.getBoundingClientRect();
            const x = e.clientX - rect.left; // x within container
            const y = e.clientY - rect.top;  // y within container
          
            const rotateX = ((y / rect.height) - 0.5) * 20; // max 5deg tilt
            const rotateY = ((x / rect.width) - 0.5) * -20;
          
            projectCard.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        projectCard.addEventListener('mouseleave', () => {
            projectCard.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
        });
    }
    
})