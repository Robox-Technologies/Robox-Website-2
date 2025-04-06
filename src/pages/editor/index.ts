
import * as Blockly from 'blockly';
import "../root/root.scss"

import theme from "./blockly/theme"

import {toolbox} from "./blockly/toolbox"
import "./blockly/toolboxStyling"
import { RoundedFlyout } from './blockly/toolboxStyling';

let workspace: Blockly.WorkspaceSvg | null = null;

function start() {
    // Create main workspace.
    if (!toolbox) return;
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        theme: theme,
        plugins: {
            flyoutsVerticalToolbox: RoundedFlyout
        }
    });
}
document.addEventListener("DOMContentLoaded", start)