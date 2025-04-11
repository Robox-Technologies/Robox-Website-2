
import { pythonGenerator, Order } from 'blockly/python'


pythonGenerator.forBlock['motor_move'] = function (block, generator) {
    var dropdown_direction = block.getFieldValue('direction');
    // TODO: Assemble python into code variable.
    var code = `motors.run_motors(${dropdown_direction}*motor_speed*left_motor_polarity,${dropdown_direction}*motor_speed*right_motor_polarity)\n`;
    return code;
};

pythonGenerator.forBlock['motor_turn'] = function (block, generator) {
    var dropdown_direction = block.getFieldValue('direction');
    // TODO: Assemble python into code variable.
    var code = `motors.run_motors(left_motor_polarity*${dropdown_direction == "right" ? 1 : -1}*motor_speed,${dropdown_direction == "left" ? 1 : -1}*right_motor_polarity*motor_speed)\n`;
    return code;
};

pythonGenerator.forBlock['motor_percentage'] = function (block, generator) {
    var value_left_motor = generator.valueToCode(block, 'left_motor', Order.ATOMIC);
    var value_right_motor = generator.valueToCode(block, 'right_motor', Order.ATOMIC);
    // TODO: Assemble python into code variable.
    var code = `motors.run_motors(left_motor_polarity*${value_left_motor},right_motor_polarity*${value_right_motor})\n`;
    return code;
};
pythonGenerator.forBlock['motor_switch'] = function (block, generator) {
    const dropdown_motor = block.getFieldValue('motor');
    let polarities = {"left": "left_motor_polarity", "right": "right_motor_polarity", "both": "left_motor_polarity = right_motor_polarity"}
    if (dropdown_motor === "both") {
        return `left_motor_polarity = left_motor_polarity*-1\nright_motor_polarity = right_motor_polarity*-1\n`
    }
    else {
        return `${dropdown_motor}_motor_polarity = ${dropdown_motor}_motor_polarity*-1\n`
    }
}
pythonGenerator.forBlock['motor_single_move'] = function (block, generator) {
    var dropdown_motor = block.getFieldValue('motor');
    var value_power = generator.valueToCode(block, 'power', Order.ATOMIC);
    // TODO: Assemble python into code variable.
    var code = `motors.run_motors(${dropdown_motor == "right" ? 1 : 0}*left_motor_polarity*${value_power},${dropdown_motor == "right" ? 0 : 1}*right_motor_polarity*${value_power})\n`;
    return code;
};