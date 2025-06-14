
import * as Blockly from 'blockly';

import { ContinuousToolbox, ContinuousMetrics, registerContinuousToolbox } from '@blockly/continuous-toolbox';


import theme from "./blockly/theme"

import {toolbox} from "./blockly/toolbox"
import "./blockly/toolboxStyling"




import { CustomUndoControls, CustomZoomControls } from './blockly/customUI';
import { MyWorkspace } from '../../@types/blockly';



import { Project } from '../../@types/projects';
import { getProject, loadBlockly, saveBlockly, renameProject, downloadBlocklyProject } from '../../root/serialization';

import {registerFieldColour} from '@blockly/field-colour';
import { postBlocklyWSInjection } from './usb';
import { registerControls } from './controls';
registerFieldColour();
import "./instructions/UF2Flash"
import "./instructions/colourCalibration"
const blocks = require.context("./blockly/blocks", false, /\.ts$/);
const generators = require.context("./blockly/generators", false, /\.ts$/);

blocks.keys().forEach(modulePath => {
    const block = blocks(modulePath);
});

generators.keys().forEach(modulePath => {
    const generator = generators(modulePath);
    // use generator
});


document.addEventListener("DOMContentLoaded", () => {
    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        theme: theme,
        plugins: {
            'flyoutsVerticalToolbox': "RoboxFlyout",
            'toolbox': ContinuousToolbox,
        },
        zoom: {
            controls: false,
        },
        move:{
            scrollbars: {
                horizontal: true,
                vertical: true
            },
            drag: true,
            wheel: false
        },
        grid: {
            spacing: 20,
            length: 5,
            colour: "#ccc",
        },
        renderer: 'Zelos',
        trashcan: false,
    }) as MyWorkspace;
    const urlParams = new URLSearchParams(window.location.search);
    const workspaceId = urlParams.get('id')
    let project: null | Project = null
    if (workspaceId) {
        project = getProject(workspaceId)
    }
    else return
    if (!project) return
// Control + scroll for zoom,
// Scroll for vertical movement,
// Shift + scroll for horizontal movement
    registerControls(workspace)
    if ("serial" in navigator) {
        postBlocklyWSInjection()
    }
    else {
        const connectionManagment = document.getElementById("connection-managment")
        const downloadRoboxManagment = document.getElementById("code-download-robox-button")
        if (!connectionManagment) return
        if (!downloadRoboxManagment) return 

        connectionManagment.setAttribute("status",  "no-serial")
        downloadRoboxManagment.addEventListener("click", () => {
            downloadBlocklyProject(workspaceId)
        })
    }
    workspace.customZoomControls = new CustomZoomControls(workspace);
    workspace.customZoomControls.init();
    
    workspace.undoControls = new CustomUndoControls(workspace)
    workspace.undoControls.init()
    
    Blockly.browserEvents.conditionalBind(window, 'resize', null, () => { //On workspace resize, resize our custom UI
            if (workspace.customZoomControls) workspace.customZoomControls.position()
            if (workspace.undoControls) workspace.undoControls.position()
        }
    );



    
    const nameForm = document.getElementById("project-name-form") as HTMLFormElement | null
    const nameInput = document.getElementById("project-name-input") as HTMLInputElement | null
    const downloadButton = document.getElementById("download-button") as HTMLButtonElement | null
    if (!downloadButton) return
    if (!nameInput) return
    if (!nameForm) return
    nameInput.value = project["name"]
    nameInput.addEventListener("blur", (event) => {
        if (nameInput.value !== project["name"]) {
            let newName = nameInput.value
            renameProject(workspaceId, newName)
        }
    })
    nameForm.addEventListener("submit", (event) => {
        event.preventDefault()
        if (nameInput.value !== project["name"]) {
            let newName = nameInput.value
            renameProject(workspaceId, newName)
        }
    })
    downloadButton.addEventListener("click", () => {
        saveBlockly(workspaceId, workspace)
        downloadBlocklyProject(workspaceId)
    })
    


    loadBlockly(workspaceId, workspace)

    if (project["thumbnail"] === '') {
        saveBlockly(workspaceId, workspace);
    }
    workspace.addChangeListener((event) => { // Saving every time block is added
        if (event.isUiEvent) return;
        saveBlockly(workspaceId, workspace);
    });
    

    const calibrateButton = document.getElementById("robox-settings-calibrate") as HTMLButtonElement | null
    const calibrateModal = document.getElementById("color-calibration-modal") as HTMLDialogElement | null
    if (!calibrateButton) return
    if (!calibrateModal) return
    calibrateButton.addEventListener("click", () => {
        calibrateModal.showModal()
    })
    calibrateModal.addEventListener("close", () => {
        if (calibrateModal.querySelector("#calibrate-button[calibrating]")) {
            calibrateModal.querySelector("#calibrate-button")?.removeAttribute("calibrating")
        }
    })
    setupFlyoutHoverPreview(workspace);
})  



let previewBlock: Blockly.BlockSvg | null = null;

export function setupFlyoutHoverPreview(workspace: Blockly.WorkspaceSvg): void {
  const flyout = workspace.getFlyout();
  const flyoutWs = flyout?.getWorkspace();

  if (!flyoutWs) return;

  flyoutWs.addChangeListener((e: Blockly.Events.Abstract) => {
    // ✔ FIX 1: Type guard for UI events
    if (
      e.isUiEvent &&
      (e as Blockly.Events.UiBase & { element?: string }).element === 'commentOpen'
    ) {
      return;
    }

    const flyoutBlocks = flyoutWs.getAllBlocks(false);

    for (const block of flyoutBlocks) {
      const svgRoot = (block as Blockly.BlockSvg).getSvgRoot?.();
      if (!svgRoot) continue;

      // ✔ FIX 2: Avoid re-attaching events
      if ((svgRoot as any).__hoverPreviewBound) continue;
      (svgRoot as any).__hoverPreviewBound = true;

      svgRoot.addEventListener('mouseenter', () => {
        if (previewBlock) {
          previewBlock.dispose(false);
          previewBlock = null;
        }

        // ✔ FIX 3: Ensure blockToDom returns an Element
        const xml = Blockly.Xml.blockToDom(block, true) as Element;
        const newBlock = Blockly.Xml.domToBlock(xml, workspace);

        if (!(newBlock instanceof Blockly.BlockSvg)) return;
        previewBlock = newBlock;

        previewBlock.setMovable(false);
        previewBlock.setDeletable(false);
        previewBlock.setEditable(false);
        previewBlock.getSvgRoot()?.setAttribute('opacity', '0.5');

        // ✔ FIX 4: Use correct svgGroup_ with a cast
        const svgGroup = (block as any).svgGroup_;
        if (!svgGroup) return;

        const flyoutPos = Blockly.utils.svgMath.getRelativeXY(svgGroup);
        const offset = 40;

        previewBlock.moveBy(flyoutPos.x + offset, flyoutPos.y);
      });

      svgRoot.addEventListener('mouseleave', () => {
        if (previewBlock) {
          previewBlock.dispose(false);
          previewBlock = null;
        }
      });
    }
  });
}
