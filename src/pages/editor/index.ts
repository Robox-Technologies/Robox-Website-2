
import * as Blockly from 'blockly';


import {toolbox} from "./blockly/toolbox"
import "./blockly/toolboxStyling"
let workspace: Blockly.WorkspaceSvg | null = null;

function start() {
    // Create main workspace.
    if (!toolbox) return;
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
    });
}
document.addEventListener("DOMContentLoaded", start)