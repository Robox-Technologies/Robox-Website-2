import { createProject, getProject, getProjects } from "../../root/serialization";
import { Project, Projects } from "types/projects";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { toggleToolbar, moveToolbar } from "../../root/toolbar";


dayjs.extend(relativeTime);

async function applyProjects() {
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach((card) => {
        card.remove();
    });

    const projectContainer = document.getElementById("project-holder");
    const projectTemplate = document.getElementById("projectCardTemplate") as HTMLTemplateElement;
    const toolbarModal = document.getElementById("project-toolbar") as HTMLDialogElement;
    if (!projectContainer || !projectTemplate || !toolbarModal) return;

    const projects = getProjects();
    const projectIds = Object.keys(projects);
    let sortedByTime = projectIds.sort((a, b) =>
        dayjs(projects[b].time).diff(dayjs(projects[a].time))
    );
    const newCards: HTMLElement[] = [];
    for (const uuid of sortedByTime) {
        let project = projects[uuid];
        let card = createProjectCard(uuid, project);
        card.addEventListener("click", (event: MouseEvent) => {
            let item = event.target as HTMLElement | null;
            if (!item) return;
            window.location.href = `/editor?id=${uuid}`;
            event.stopPropagation();
        });
        let options = card.querySelector(".options") as HTMLButtonElement | null;
        if (!options) continue;
        options.addEventListener("click", (event: MouseEvent) => {
            event.stopImmediatePropagation();
            moveToolbar(toolbarModal, options);
            toggleToolbar(toolbarModal, true);
        });
        projectContainer.appendChild(card);
        newCards.push(card);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    applyProjects();
    const createProjectButton = document.getElementById("create-project");
    createProjectButton?.addEventListener("click", () => {
        createProject("unnamed project");
        applyProjects();
    });
});

function createProjectCard(uuid: string, project: Project): HTMLElement {
    const projectTemplate = document.getElementById("projectCardTemplate") as HTMLTemplateElement;
    if (!projectTemplate) return document.createElement("div");

    const fragment = projectTemplate.content.cloneNode(true) as DocumentFragment;
    const clone = fragment.querySelector(".card") as HTMLElement;
    if (!clone) return document.createElement("div");

    const title = clone.querySelector(".card-title-text");
    const time = clone.querySelector(".card-description");
    const image = clone.querySelector(".card-image") as HTMLImageElement | null;
    const options = clone.querySelector(".options") as HTMLButtonElement | null;
    if (!title || !time || !image || !options) return document.createElement("div");

    let projectTime = dayjs(project.time);

    image.src = project.thumbnail;
    title.textContent = project.name;
    time.textContent = projectTime.fromNow();
    clone.id = uuid;

    return clone;
}
