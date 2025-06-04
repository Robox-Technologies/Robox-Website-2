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
            //Check what element is hovered over
            //If it is a toolbox, dont scroll the workspace
            if (event.target instanceof HTMLElement && event.target.closest('.blocklyToolboxDiv')) {
                return;
            }
            workspace.scrollY += dy
        }
        workspace.render()
    }, { passive: false });
}