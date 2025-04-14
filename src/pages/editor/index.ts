
import * as Blockly from 'blockly';
import "../root/root.scss"

import { pico } from './communication/communicate';

import theme from "./blockly/theme"

import {toolbox} from "./blockly/toolbox"
import "./blockly/toolboxStyling"
import { RoundedFlyout } from './blockly/toolboxStyling';
import { CustomUndoControls, CustomZoomControls } from './blockly/customUI';
import { MyWorkspace } from '../types/blockly';

import {registerFieldColour} from '@blockly/field-colour';
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

document.addEventListener("DOMContentLoaded", (event) => {
    if (!toolbox) return;
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
    workspace.customZoomControls = new CustomZoomControls(workspace);
    workspace.customZoomControls.init();

    workspace.undoControls = new CustomUndoControls(workspace)
    workspace.undoControls.init()

    Blockly.browserEvents.conditionalBind(window, 'resize', null, () => { //On workspace resize, resize our custom UI
            if (workspace.customZoomControls) workspace.customZoomControls.position()
            if (workspace.undoControls) workspace.undoControls.position()
        }
    );
})

