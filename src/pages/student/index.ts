import { createProject, deleteProject, getProject, getProjects } from "../../root/serialization";
import { Project, Projects } from "../../@types/projects";
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

                wrapper.setAttribute("toolbar", "")
                toolbar.closest(".card-wrapper")?.removeAttribute("toolbar")
                clone.appendChild(toolbaClone)
                toolbaClone.querySelector("#project-delete")?.addEventListener("click", (event) => {
                    let deleteModal = document.getElementById("delete-modal") as HTMLDialogElement | null
                    if (!deleteModal) return
                    deleteModal.showModal()
                })
                toolbaClone.querySelector("#project-edit")?.addEventListener("click", (event) => {
                    let editModal = document.getElementById("edit-modal") as HTMLDialogElement | null
                    if (!editModal) return
                    editModal.showModal()
                    editModal.querySelector("#edit-project-name")?.setAttribute("value", project["name"])
                })
                    
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
    const createProjectButton = document.getElementById("create-project")
    createProjectButton?.addEventListener("click", (event) => {
        createProject("unnamed project")
        applyProjects()
        afterProjectsSetup()
    })
}
function hoverElement(element: HTMLElement, up: boolean, rotateX: number = 0, rotateY: number = 0) {
    element.style.transform = `scale(${up ? 1.05 : 1})`;//`translateY(${up ? -10 : 0}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

document.addEventListener("DOMContentLoaded", (event) => {
    //Populate the projects
    applyProjects()

    afterProjectsSetup();
    //TODO: This is janky and should be replaced with a better solution
    let deleteModal = document.getElementById("delete-modal") as HTMLDialogElement | null
    if (!deleteModal) return
    let deleteConfirmButton = deleteModal.querySelector("#delete-confirm-button") as HTMLButtonElement | null
    if (!deleteConfirmButton) return
    deleteConfirmButton.addEventListener("click", (event) => {
        // Move the toolbar out of the project card
        let toolbar = document.getElementById("toolbar") as HTMLDialogElement | null
        if (toolbar) {
            toolbar.remove();
        }
        let projectCard = document.querySelector(".card-wrapper[toolbar]") as HTMLElement | null
        if (!projectCard) return
        let projectId = projectCard.querySelector(".card")?.id
        if (!projectId) return
        let projects = getProjects()
        if (!projects[projectId]) return
        deleteProject(projectId)
        projectCard.remove()
        deleteModal.close()
        applyProjects()
    })
    const editModal = document.getElementById("edit-modal") as HTMLDialogElement | null
    if (!editModal) return
    const editConfirmButton = document.querySelector("#edit-confirm-button") as HTMLButtonElement | null
    if (!editConfirmButton) return
    editConfirmButton.addEventListener("click", (event) => {
        let projectCard = document.querySelector(".card-wrapper[toolbar]") as HTMLElement | null
        if (!projectCard) return
        let projectId = projectCard.querySelector(".card")?.id
        if (!projectId) return
        let projects = getProjects()
        if (!projects[projectId]) return
        let project = projects[projectId]
        let nameInput = document.getElementById("edit-project-name") as HTMLInputElement | null
        if (!nameInput) return
        project["name"] = nameInput.value
        localStorage.setItem("roboxProjects", JSON.stringify(projects))
        let toolbar = document.getElementById("toolbar") as HTMLDialogElement | null
        if (toolbar) {
            let clone = document.querySelector("body")?.appendChild(toolbar);
            clone?.removeAttribute("open");
        }
        editModal.close()
        applyProjects()
        // move the toolbar out of the project card
        
    })
})
