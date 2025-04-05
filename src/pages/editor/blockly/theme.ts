import * as Blockly from 'blockly';


Blockly.Msg.SENSOR_HUE = "0";
Blockly.Msg.EVENT_HUE = "190";
Blockly.Msg.MOTOR_HUE = "176";
Blockly.Msg.SYSTEM_HUE = "42";






export default Blockly.Theme.defineTheme('Robox', {
    name: "robox",
    'base': Blockly.Themes.Classic,
    componentStyles: {
        'workspaceBackgroundColour': '#A1EEBD',
        'toolboxBackgroundColour': "#F",
        'flyoutBackgroundColour': '#F6F4C3',
        'flyoutOpacity': 1,
    },
    categoryStyles: {
        'sensor_category': {
            'colour': '%{BKY_SENSOR_HUE}'
        },
        'motor_category': {
            'colour': '%{BKY_MOTOR_HUE}'
        },
        "system_category": {
            'colour': '%{BKY_SYSTEM_HUE}'
        },
        "events_category": {
            'colour': '%{BKY_EVENT_HUE}'
        },
    },


    startHats: true
});