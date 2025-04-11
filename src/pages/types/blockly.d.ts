import * as Blockly from 'blockly';
import { CustomZoomControls } from '../editor/blockly/customUI';
interface MyWorkspace extends Blockly.WorkspaceSvg {
    customZoomControls?: CustomZoomControls;
}