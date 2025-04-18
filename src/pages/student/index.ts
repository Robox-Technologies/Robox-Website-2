import { createProject, getProject, getProjects } from "../../root/serialization";
import { Project, Projects } from "../../types/projects";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js"
dayjs.extend(relativeTime)



let createButtonHTML: string | undefined = undefined
function applyProjects() {
    const projectContainer = document.getElementById("project-holder")
    if (!projectContainer) return
    if (!createButtonHTML) {
        createButtonHTML = document.getElementById("create-project")?.outerHTML
    }
    if (!createButtonHTML) return
    projectContainer.innerHTML = createButtonHTML
    const projectTemplate = document.getElementById("projectCardTemplate") as HTMLTemplateElement
    if (!projectTemplate) return
    const projects = getProjects()
    let projectIds = Object.keys(projects)
    let sortedByTime = projectIds.sort((key1, key2) => dayjs(projects[key2]["time"]).diff(dayjs(projects[key1]["time"])))
    for (const uuid of sortedByTime) {
        let project = projects[uuid] as Project
        if (!project) continue
        const clone = projectTemplate.content.cloneNode(true) as HTMLElement;

        const title = clone.querySelector(".card-title-text")
        const time = clone.querySelector(".card-description")
        let projectTime = dayjs(project["time"])

        if (!title || !time) return
        
        title.textContent = project["name"];
        time.textContent = projectTime.fromNow()
        projectContainer.appendChild(clone)
    }
}
function afterProjectsSetup() {
    //Create the hover effect
    const projectCards = document.querySelectorAll(".project-card, #create-project, .lesson-card") as NodeListOf<HTMLElement>
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
    //Create the projects
    const createProjectButton = document.getElementById("create-project")
    createProjectButton?.addEventListener("click", (event) => {
        createProject("Hello!")
    })
}
document.addEventListener("DOMContentLoaded", (event) => {
    //Populate the projects
    applyProjects()

    afterProjectsSetup()
})