import * as Blockly from 'blockly';
export class CustomZoomControls {
    private workspace: Blockly.WorkspaceSvg;
    private container: HTMLDivElement | null = null;
  
    constructor(workspace: Blockly.WorkspaceSvg) {
        this.workspace = workspace;
    }
  
    init() {
        if (this.container) return; // already initialized
        this.container = document.createElement('div');
        this.container.id = 'blocklyCustomZoom'; //Creating the zoom main element
        this.container.style.position = 'absolute';
    
        const zoomIn = document.createElement('button');
        zoomIn.classList.add("button")
        zoomIn.innerHTML = '<i class="fa-solid fa-plus"></i>'; //zoom in element
        zoomIn.onclick = () => this.workspace.zoomCenter(1);

        const zoomOut = document.createElement('button');
        zoomOut.innerHTML = '<i class="fa-solid fa-minus"></i>'; //zoom out element
        zoomOut.classList.add("button")
        zoomOut.onclick = () => this.workspace.zoomCenter(-1);
    
        this.container.appendChild(zoomIn);
        this.container.appendChild(zoomOut);
    
        const parent = this.workspace.getParentSvg()?.parentNode as HTMLElement | null;
        if (parent) {
            parent.appendChild(this.container);
        }
    
        this.position();
        this.workspace.addChangeListener(() => this.position());
    }
  
    position() {
        if (!this.container) return;
    
        const metrics = this.workspace.getMetrics();
        const MARGIN = 40;
    
        const left = metrics.viewWidth + metrics.absoluteLeft - this.container.offsetWidth - MARGIN; 
    
        const top = metrics.viewHeight + metrics.absoluteTop - this.container.offsetHeight - MARGIN;
    
        this.container.style.left = `${left}px`;
        this.container.style.top = `${top}px`;
    }
  
    dispose() {
        if (!this.container) return;
        this.container.remove();
        this.container = null;
    }
  
    getBoundingRectangle(): Blockly.utils.Rect | null {
        if (!this.container) return null;
    
        const rect = this.container.getBoundingClientRect();
        return new Blockly.utils.Rect(rect.top, rect.bottom, rect.left, rect.right);
    }
}
  