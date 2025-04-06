import * as Blockly from 'blockly';

import archSVG from "./Arch.svg"
type HexColor = `#${string}`;

const animationTime = 300
const extensionAmount = 20;

const archWidth = 48
const iconHeight = 20

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

    }
    /** @override */
    createRowContentsContainer_() {
        const dom = super.createRowContentsContainer_();
        const rectangle = document.createElement("div")
        rectangle.className = "extender"
        rectangle.style.background = this.colour_
        const container = document.createElement("div")
        container.className = "side-arch"
        container.innerHTML = archSVG
        const arch = container.querySelector("svg > path")
        if (!arch || !(arch instanceof SVGElement)) return dom
        arch.style.fill = this.colour_;
        dom.appendChild(rectangle)
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
    /** @override */
    setSelected(isSelected: boolean){
        const dom = this.htmlDiv_
        const icon = dom?.querySelector(".categoryIcon")
        const extender = dom?.querySelector(".extender")
        if (!icon || !(icon instanceof HTMLElement)) return
        if (!extender || !(extender instanceof HTMLElement)) return
        if (isSelected) {
            const extenderAnimation = [
                { width: `${extender.offsetWidth}px` },
                { width: `${extensionAmount}px` },
            ];
            const iconAnimation = [
                { left: `${icon.offsetLeft}px` },
                { left: `${((archWidth/3)-(iconHeight/2))+extensionAmount}px` },
            ];
            icon.animate(iconAnimation, { duration: animationTime, iterations: 1})
            extender.animate(extenderAnimation, { duration: animationTime, iterations: 1})
            extender.classList.add("extended")
            icon.classList.add("extended")
        }
        else {
            const extenderAnimation = [
                { width: `${extender.offsetWidth}px` },
                { width: `0px` },
            ];
            const iconAnimation = [
                { left: `${icon.offsetLeft}px` },
                { left: `${((archWidth/3)-(iconHeight/2))}px` },
            ];

            icon.animate(iconAnimation, { duration: animationTime, iterations: 1})
            extender.animate(extenderAnimation, { duration: animationTime, iterations: 1})
            extender.classList.remove("extended")
            icon.classList.remove("extended")
        }
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
export class RoundedFlyout extends Blockly.VerticalFlyout {
    override readonly CORNER_RADIUS = 0;
    constructor(workspaceOptions: Blockly.Options) {
        super(workspaceOptions);
        
    }
}

//TODO: add names for the variable and procedure category

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