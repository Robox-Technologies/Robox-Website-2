import * as Blockly from 'blockly/core';


const events = [
    {
        "type": "event_begin",
        "message0": "Begin event %1 %2",
        "args0": [
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "event_code"
            }
        ],
        "style": "event_blocks",
        "tooltip": "",
        "helpUrl": ""
    },
]


Blockly.defineBlocksWithJsonArray(events);