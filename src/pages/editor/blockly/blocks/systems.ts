import * as Blockly from 'blockly/core';

const systems = [{
    "type": "sleep",
    "message0": "sleep for %1 seconds",
    "args0": [
        {
            "type": "input_value",
            "name": "time",
            "check": "Number"
        }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": 'system_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "led_toggle",
    "message0": "toggle led",
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": 'system_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "led_bool",
    "message0": "turn LED %1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "state",
            "options": [
                [
                    "ON",
                    "1"
                ],
                [
                    "OFF",
                    "0"
                ]
            ]
        }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": 'system_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "get_time",
    "message0": "current time",
    "inputsInline": true,
    "output": "Number",
    "style": 'system_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "get_led_state",
    "message0": "led state",
    "inputsInline": true,
    "output": "Boolean",
    "style": 'system_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "wait_until",
    "message0": "wait until %1",
    "args0": [
        {
            "type": "input_value",
            "name": "bool",
            "check": "Boolean"
        }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": 'system_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "print",
    "message0": "print %1",
    "args0": [
        {
            "type": "input_value",
            "name": "string",
            "check": "String"
        }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": 'system_blocks',
    "tooltip": "",
    "helpUrl": ""
}]

Blockly.defineBlocksWithJsonArray(systems);