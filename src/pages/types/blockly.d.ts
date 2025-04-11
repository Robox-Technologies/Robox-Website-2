import * as Blockly from 'blockly';
import { CustomUndoControls, CustomZoomControls } from '../editor/blockly/customUI';
interface MyWorkspace extends Blockly.WorkspaceSvg {
    customZoomControls?: CustomZoomControls;
    undoControls?: CustomUndoControls;
}