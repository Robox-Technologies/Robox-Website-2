
import { pythonGenerator } from 'blockly/python'

pythonGenerator.forBlock['event_begin'] = function (block, generator) {
    var event_code = generator.statementToCode(block, 'event_code');
    var code = `def event_begin():\n
  global left_motor_polarity, right_motor_polarity\n${event_code}`;
    return code;
};
