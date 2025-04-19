import { createProject, getProject, getProjects } from "../../root/serialization";
import { Project, Projects } from "../../types/projects";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js"
dayjs.extend(relativeTime)

const offsetLeftToolbar = 10
const offsetTopToolbar = 10


let createButtonHTML: string | undefined = undefined
function applyProjects() {
    const projectContainer = document.getElementById("project-holder")
    if (!projectContainer) return
    if (!createButtonHTML) {
        createButtonHTML = `<div class="card-wrapper">${document.getElementById("create-project")?.outerHTML}</div>`
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
        const fragment = projectTemplate.content.cloneNode(true) as DocumentFragment;
        const clone = fragment.querySelector(".card") as HTMLElement

        const title = clone.querySelector(".card-title-text")
        const time = clone.querySelector(".card-description")
        const image = clone.querySelector(".card-image") as HTMLImageElement
        const wrapper = document.createElement("div")
        wrapper.classList.add("card-wrapper")

        clone.id = uuid
        let projectTime = dayjs(project["time"])

        if (!title || !time || !image) return
        image.src = project["thumbnail"]
        title.textContent = project["name"];
        time.textContent = projectTime.fromNow()
        clone.addEventListener("click", (event: MouseEvent) => {
            // if (toolbarModal.hasAttribute("open") || e.target.closest("#toolbar")) return
            let item = event.target as HTMLElement | null
            if (!item) return
            if (item.closest("#toolbar")) return
            let dots = item.closest(".options") //checking if there is the dots object near or above the item
            if (dots === null) { //If the dialog is clicked it will not have dots (as dots is its child)
                window.location.href = `/editor?id=${clone.id}`
            }
            else { //if it is the edit menu dots clicked
                let toolbar = document.getElementById("toolbar") as HTMLDialogElement
                if (!toolbar) return
                let toolbaClone = toolbar.cloneNode(true) as HTMLDialogElement
                
                let options = clone.querySelector(".options") as HTMLButtonElement
                if (!options) return
                toolbaClone.style.left = (options.offsetLeft+offsetLeftToolbar).toString()
                toolbaClone.style.top = (options.offsetTop+offsetTopToolbar).toString()


                clone.appendChild(toolbaClone)
                toolbar.remove()
                toolbaClone.show()
                hoverElement(clone, false)
            }
            event.stopPropagation()
        })
        wrapper.appendChild(clone)
        projectContainer.appendChild(wrapper)
    }
}
function afterProjectsSetup() {
    //Create the hover effect
    const projectCards = document.querySelectorAll(".card-wrapper") as NodeListOf<HTMLElement>
    for (const projectCard of projectCards) {
        let element: HTMLElement | null = null

        projectCard.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = projectCard.getBoundingClientRect();
            const x = e.clientX - rect.left; // x within container
            const y = e.clientY - rect.top;  // y within container
            const rotateX = ((y / rect.height) - 0.5) * 20; // max 5deg tilt
            const rotateY = ((x / rect.width) - 0.5) * -20;
            element = projectCard.firstElementChild as HTMLElement
            if (!element) return
            if (projectCard.querySelector("#toolbar")) return //Checking if element has the toolbar in it
            hoverElement(element, true, rotateX, rotateY);
        });
        projectCard.addEventListener('mouseleave', () => {
            element = projectCard.firstChild as HTMLElement
            if (!element) return
            hoverElement(element, false)
        });
    }
    //Create the projects
    const createProjectButton = document.getElementById("create-project")
    createProjectButton?.addEventListener("click", (event) => {
        createProject("Hello!")
    })
}
function hoverElement(element: HTMLElement, up: boolean, rotateX: number = 0, rotateY: number = 0) {
    element.style.transform = `translateY(${up ? -10 : 0}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}
document.addEventListener("DOMContentLoaded", (event) => {
    //Populate the projects
    applyProjects()

    afterProjectsSetup()
})
