import { Workspace, WorkspaceSvg } from "blockly";
const scrollSpeed = 1.1; // Adjust for sensitivity
const controlScrollSpeedDown = 0.2; // Adjust for sensitivity when zooming


export function registerControls(workspace: WorkspaceSvg) {
    const toolbox = document.querySelector(".blocklyToolbox")
    document.addEventListener('wheel', (event: WheelEvent) => {
        if (document.querySelector('dialog[open]')) return;
        event.preventDefault();
        
        const dy = event.deltaY * scrollSpeed;
        if (event.target instanceof HTMLElement && event.target.closest(".blocklyToolbox")) {
            // You can handle wheel event inside toolbox here
            // For example, programmatically scroll the toolbox:
            if (toolbox) {
                // Scroll the toolbox vertically by dy pixels
                toolbox.scrollTop += dy;
            }
            return
        }
        //Two seperate variables in case we want to change the formulas later
        const dx = event.deltaX * scrollSpeed;
        // Shift + scroll for horizontal movement
        if (event.target instanceof HTMLElement && event.target.closest(".blocklyToolbox")) {
                
        }
        if (event.shiftKey) {
            workspace.scrollX += dx
        }
        // Scroll for vertical movement,
        else {
            //Check what element is hovered over
            //If it is a toolbox, dont scroll the workspace
            if (event.target instanceof HTMLElement && ( event.target.closest('.blocklyToolboxDiv'))) {
                return;
            }
            
            workspace.scrollY += dy
        }
        workspace.render()
    }, { passive: false });
}