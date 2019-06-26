import LanguagesChart from './LanguagesChart';

export default class FastestGrowingLanguagesChart extends LanguagesChart {
  _calculateCustomScore(oldValue, newValue) {
    return newValue / oldValue * 100;
  }

  _formatHintValue(hintValue) {
    return `${Math.round(hintValue)}% growth`;
  }
}
