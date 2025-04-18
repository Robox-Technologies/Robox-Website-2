
import * as Blockly from 'blockly';



import theme from "./blockly/theme"

import {toolbox} from "./blockly/toolbox"
import "./blockly/toolboxStyling"
import { RoundedFlyout } from './blockly/toolboxStyling';
import { CustomUndoControls, CustomZoomControls } from './blockly/customUI';
import { MyWorkspace } from '../types/blockly';

import { Project } from '../../types/projects';
import { getProject, loadBlockly, saveBlockly } from '../../root/serialization';

import {registerFieldColour} from '@blockly/field-colour';
import { postBlocklyWSInjection } from './usb';
registerFieldColour();

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
            flyoutsVerticalToolbox: RoundedFlyout
        },
        zoom: {
            controls: false,
        },
        trashcan: false,
    }) as MyWorkspace;
    postBlocklyWSInjection()
    workspace.customZoomControls = new CustomZoomControls(workspace);
    workspace.customZoomControls.init();
    
    workspace.undoControls = new CustomUndoControls(workspace)
    workspace.undoControls.init()
    
    Blockly.browserEvents.conditionalBind(window, 'resize', null, () => { //On workspace resize, resize our custom UI
            if (workspace.customZoomControls) workspace.customZoomControls.position()
            if (workspace.undoControls) workspace.undoControls.position()
        }
    );



    const urlParams = new URLSearchParams(window.location.search);
    const workspaceId = urlParams.get('id')
    let project: null | Project = null
    if (workspaceId) {
        project = getProject(workspaceId)
    }
    else return
    if (!project) return
    loadBlockly(workspaceId, workspace)

    if (project["thumbnail"] === '') {
        saveBlockly(workspaceId, workspace);
    }
    workspace.addChangeListener((event) => { // Saving every time block is added
        if (event.isUiEvent) return;
        saveBlockly(workspaceId, workspace);
    });
})



