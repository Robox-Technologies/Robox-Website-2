
import * as Blockly from 'blockly';
import "../root/root.scss"

import theme from "./blockly/theme"

import {toolbox} from "./blockly/toolbox"
import "./blockly/toolboxStyling"
import { RoundedFlyout } from './blockly/toolboxStyling';
import { CustomZoomControls } from './blockly/customUI';
import { MyWorkspace } from '../types/blockly';


function start() {
    // Create main workspace.
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
    }) as MyWorkspace;
    workspace.customZoomControls = new CustomZoomControls(workspace);
    workspace.customZoomControls.init();
}
document.addEventListener("DOMContentLoaded", start)