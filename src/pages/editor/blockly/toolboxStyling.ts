import * as Blockly from 'blockly';

import archSVG from "./Arch.svg"
class RoboxToolboxCategories extends Blockly.ToolboxCategory {
    /**
     * Constructor for a custom category.
     * @override
     */
    constructor(categoryDef: Blockly.utils.toolbox.CategoryInfo, toolbox: Blockly.Toolbox, opt_parent: Blockly.ICollapsibleToolboxItem) {
        super(categoryDef, toolbox, opt_parent);
    }
    /** @override */
    createRowContentsContainer_() {
        const dom = super.createRowContentsContainer_();
        const container = document.createElement("div")
        container.className = "side-arch"
        container.innerHTML = archSVG
        const arch = container.querySelector("svg > path")
        if (!arch || !(arch instanceof SVGElement)) return dom
        arch.style.fill = this.colour_;
        
        dom.appendChild(container)
        return dom
    }
    /** @override */
    createLabelDom_(name: string) {
        const label = super.createLabelDom_(name);
        if (!label || !(label instanceof HTMLElement)) return label
        label.style.color = this.colour_
        return label
    }
}
class RoboxToolboxSeperator extends Blockly.ToolboxSeparator {
    constructor(seperatorDef: Blockly.utils.toolbox.SeparatorInfo, toolbox: Blockly.Toolbox) {
        super(seperatorDef, toolbox);
    }
    createDom_(): HTMLDivElement {
        const dom = super.createDom_();
        const seperator = document.createElement("div")
        seperator.className = "seperator"
        dom.appendChild(seperator)
        return dom
    }
}

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    RoboxToolboxCategories, true
);
Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxSeparator.registrationName,
    RoboxToolboxSeperator, true
);