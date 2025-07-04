import { createProject, getProject, getProjects } from "../../root/serialization";
import { Project, Projects } from "../../@types/projects";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js"
import { toggleToolbar, moveToolbar } from "../../root/toolbar";
dayjs.extend(relativeTime)

function applyProjects() {
    const projectCards = document.querySelectorAll(".project-card")
    projectCards.forEach((card) => {
        card.remove()
    })

    const projectContainer = document.getElementById("project-holder")
    const projectTemplate = document.getElementById("projectCardTemplate") as HTMLTemplateElement
    const toolbarModal = document.getElementById("project-toolbar") as HTMLDialogElement
    if (!projectContainer || !projectTemplate || !toolbarModal) return

    const projects = getProjects()
    let projectIds = Object.keys(projects)

    let sortedByTime = projectIds.sort((key1, key2) => dayjs(projects[key2]["time"]).diff(dayjs(projects[key1]["time"])))

    for (const uuid of sortedByTime) {
        let project = projects[uuid]
        let card = createProjectCard(uuid, project)
        // The listner for redirecting to the editor
        card.addEventListener("click", (event: MouseEvent) => {
            // if (toolbarModal.hasAttribute("open") || e.target.closest("#toolbar")) return
            let item = event.target as HTMLElement | null
            if (!item) return
            window.location.href = `/editor?id=${uuid}`
            event.stopPropagation()
        })
        //The listener for the hover effect + toolbar
        let options = card.querySelector(".options") as HTMLButtonElement
        if (!options) continue
        options.addEventListener("click", (event: MouseEvent) => {
            event.stopImmediatePropagation()
            moveToolbar(toolbarModal, options)
            toggleToolbar(toolbarModal, true)
        })
        projectContainer.appendChild(card)
    }
}


document.addEventListener("DOMContentLoaded", (event) => {
    //Populate the projects
    applyProjects()
    const createProjectButton = document.getElementById("create-project")
    createProjectButton?.addEventListener("click", (event) => {
        createProject("unnamed project")
        applyProjects()
    })
})
function createProjectCard(uuid: string, project: Project): HTMLElement {
    const projectTemplate = document.getElementById("projectCardTemplate") as HTMLTemplateElement
    if (!projectTemplate) return document.createElement("div")

    const fragment = projectTemplate.content.cloneNode(true) as DocumentFragment;
    const clone = fragment.querySelector(".card") as HTMLElement

    const title = clone.querySelector(".card-title-text")
    const time = clone.querySelector(".card-description")
    const image = clone.querySelector(".card-image") as HTMLImageElement
    const options = clone.querySelector(".options") as HTMLButtonElement
    if (!title || !time || !image || !options) return document.createElement("div")

    let projectTime = dayjs(project["time"])

    image.src = project["thumbnail"]
    title.textContent = project["name"];
    time.textContent = projectTime.fromNow()
    options.style.setProperty("anchor-name", `--project-${uuid}`)
    clone.id = uuid

    return clone
}
