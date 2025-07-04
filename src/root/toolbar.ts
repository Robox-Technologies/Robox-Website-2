
let anchorAmount: number = 0;

document.addEventListener("click", (event: MouseEvent) => {
    let item = event.target as HTMLElement | null
    let toolbar = document.querySelector(".toolbar") as HTMLDialogElement | null
    if (item && toolbar && toolbar.hasAttribute("open")) {
        toolbar.close()
    }
})
document.addEventListener("DOMContentLoaded", (event) => {
    const toolbarModal = document.querySelector(".toolbar") as HTMLDialogElement | null
    if (!toolbarModal) return;
    toolbarModal.addEventListener("close", (event) => {
        let oldTarget = document.querySelector(".toolbar-target") as HTMLElement | null;
        if (oldTarget) {
            oldTarget.classList.remove("toolbar-target");
        }
    });
})

export function toggleToolbar(toolbar: HTMLDialogElement, open: boolean): void {
    if (open) {
        toolbar.show();
    } else {
        toolbar.close();
    }
}
export function moveToolbar(toolbar: HTMLDialogElement, target: HTMLElement): void {
    let oldTarget = document.querySelector(".toolbar-target") as HTMLElement | null;
    if (oldTarget) {
        oldTarget.classList.remove("toolbar-target");
    }
    target.classList.add("toolbar-target");
    //check if the target has an anchor-name property, if not generate a new one
    if (!target.style.getPropertyValue("anchor-name")) {
        target.style.setProperty("anchor-name", `anchor-${anchorAmount}`);
        anchorAmount++;
    }
    toolbar.style.setProperty("position-anchor", target.style.getPropertyValue("anchor-name"));
    toolbar.style.setProperty("left", "calc(anchor(left) + 5px)");
    toolbar.style.setProperty("top", "calc(anchor(top) + 10px)");
}