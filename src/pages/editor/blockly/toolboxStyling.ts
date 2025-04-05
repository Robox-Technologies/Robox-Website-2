import * as Blockly from 'blockly';
type HexColor = `#${string}`;
class RoboxToolboxCategories extends Blockly.ToolboxCategory {
    /**
     * Constructor for a custom category.
     * @override
     */
    constructor(categoryDef: Blockly.utils.toolbox.CategoryInfo, toolbox: Blockly.Toolbox, opt_parent: Blockly.ICollapsibleToolboxItem) {
        super(categoryDef, toolbox, opt_parent);
    }
    /** @override */
    addColourBorder_(colour: HexColor){
        if (this.rowDiv_ !== null) {
            this.rowDiv_.style.backgroundColor = "colour";
        }
    }
    /** @override */
    setSelected(isSelected: boolean){
        
        if (this.rowDiv_ !== null && this.htmlDiv_ !== null) {
            // We do not store the label span on the category, so use getElementsByClassName.
            var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
            if (!(labelDom instanceof HTMLElement)) return
            console.log(this.iconDom_)
            if (isSelected) {
                // Change the background color of the div to white.
                this.rowDiv_.style.backgroundColor = 'white';
                // Set the colour of the text to the colour of the category.
                labelDom.style.color = this.colour_;
            } 
            else {
                // Set the background back to the original colour.
                this.rowDiv_.style.backgroundColor = this.colour_;
                // Set the text back to white.
                labelDom.style.color = 'white';
            }
            // This is used for accessibility purposes.
            Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
                Blockly.utils.aria.State.SELECTED, isSelected);
        }
    }
}
Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    RoboxToolboxCategories, true
);