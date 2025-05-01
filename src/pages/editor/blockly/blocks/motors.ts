

import * as Blockly from 'blockly/core';


const sensors = [
{
    "type": "motor_move",
    "message0": "move %1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "direction",
            "options": [
                [
                    "FORWARD",
                    "-1"
                ],
                [
                    "BACKWARD",
                    "1"
                ],
                [
                    "STOP",
                    "0"
                ]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": 'motor_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "motor_switch",
    "tooltip": "",
    "helpUrl": "",
    "message0": "switch %1 motors",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "motor",
            "options": [
            [
                "LEFT",
                "left"
            ],
            [
                "RIGHT",
                "right"
            ],
            [
                "both",
                "both"
            ]
            ]
        },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": 'motor_blocks',
},
{
    "type": "motor_turn",
    "message0": "turn %1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "direction",
            "options": [
                [
                    "LEFT",
                    "left"
                ],
                [
                    "RIGHT",
                    "right"
                ]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": 'motor_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "motor_percentage",
    "message0": "set motors at %1 %2 %3",
    "args0": [
        {
            "type": "input_dummy"
        },
        {
            "type": "input_value",
            "name": "left_motor",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "right_motor",
            "check": "Number"
        }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": 'motor_blocks',
    "tooltip": "",
    "helpUrl": ""
},
{
    "type": "motor_single_move",
    "message0": "move motor %1 %2 at %3 %%",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "motor",
            "options": [
                [
                    "LEFT",
                    "left"
                ],
                [
                    "RIGHT",
                    "right"
                ]
            ]
        },
        {
            "type": "input_dummy"
        },
        {
            "type": "input_value",
            "name": "power"
        }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": 'motor_blocks',
    "tooltip": "",
    "helpUrl": ""
}]

Blockly.defineBlocksWithJsonArray(sensors);
