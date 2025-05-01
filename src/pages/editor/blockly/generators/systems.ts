import { pythonGenerator, Order } from 'blockly/python'
pythonGenerator.forBlock['wait_until'] = function (block, generator) {
    var value_name = generator.valueToCode(block, 'bool', Order.ATOMIC);
    var code = `while not ${value_name}:
        time.sleep(0.01)\n`;
    return code;
};
pythonGenerator.forBlock['get_led_state'] = function (block, generator) {
    var code = 'ENV_LED.value()';
    return [code, Order.ATOMIC];
};
pythonGenerator.forBlock['get_time'] = function (block, generator) {
    var code = 'time.time()';
    return [code, Order.ATOMIC];
};
pythonGenerator.forBlock['led_bool'] = function (block, generator) {
    var value_led_on = block.getFieldValue('state');
    var code = `ENV_LED.value(${value_led_on})\n`;
    return code;
};
pythonGenerator.forBlock['led_toggle'] = function (block, generator) {
    var code = 'ENV_LED.toggle()\n';
    return code;
};
pythonGenerator.forBlock['sleep'] = function (block, generator) {
    var value_time = generator.valueToCode(block, 'time', Order.ATOMIC);
    var code = `time.sleep(${value_time})\n`;
    return code;
};
pythonGenerator.forBlock['print'] = function (block, generator) {
    var value_time = generator.valueToCode(block, 'string', Order.ATOMIC);
    var code = `print(generatePrint("console", ${value_time}))\n`;
    return code;
};