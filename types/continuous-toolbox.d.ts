declare module '@blockly/continuous-toolbox' {
    import * as Blockly from 'blockly';

    export class ContinuousFlyout extends Blockly.HorizontalFlyout {
    }

    export class ContinuousMetrics extends Blockly.MetricsManager {}
    export class ContinuousToolbox extends Blockly.Toolbox {}
}