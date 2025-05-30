
import { pythonGenerator } from 'blockly/python'
pythonGenerator.forBlock['controls_forever'] = function (block, generator) {
    var statements_do = generator.statementToCode(block, 'DO');
    var code = `while True:\n${statements_do || '    pass\n'}`;
    return code;
};
