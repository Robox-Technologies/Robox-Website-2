import * as Blockly from 'blockly';
import { CustomUndoControls, CustomZoomControls } from '../pages/editor/blockly/customUI';
interface MyWorkspace extends Blockly.WorkspaceSvg {
    customZoomControls?: CustomZoomControls;
    undoControls?: CustomUndoControls;
}