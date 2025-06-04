import { Workspace, WorkspaceSvg } from "blockly";
const scrollSpeed = 1.1; // Adjust for sensitivity
const controlScrollSpeedDown = 0.2; // Adjust for sensitivity when zooming
const zoomSpeed = 0.5
export function registerControls(workspace: WorkspaceSvg) {
    document.addEventListener('wheel', (event: WheelEvent) => {
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
            workspace.zoomCenter(dy * controlScrollSpeedDown *  zoomSpeed)
        }
        // Scroll for vertical movement,
        else {
            workspace.scrollY += dy
        }
        workspace.render()
    }, { passive: false });
}