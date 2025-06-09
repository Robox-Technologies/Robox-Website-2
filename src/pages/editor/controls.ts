import { Workspace, WorkspaceSvg } from "blockly";
const scrollSpeed = 1.5; // Adjust for sensitivity
const zoomSpeed = 0.5
export function registerControls(workspace: WorkspaceSvg) {
    document.addEventListener('wheel', (event: WheelEvent) => {
        if (document.querySelector('dialog[open]')) return;
        event.preventDefault();

        const dy = event.deltaY * scrollSpeed;
        //Two seperate variables in case we want to change the formulas later
        const dx = event.deltaX * scrollSpeed;
        // Shift + scroll for horizontal movement
        if (event.shiftKey) {
            workspace.scrollX += dx
        }
        // Control + scroll for zoom,
        else if (event.ctrlKey) {
            workspace.zoomCenter(dy * zoomSpeed)
        }
        // Scroll for vertical movement,
        else {
            workspace.scrollY += dy
        }
        workspace.render()
    }, { passive: false });
}