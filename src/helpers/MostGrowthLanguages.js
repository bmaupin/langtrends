import LanguagesChart from './LanguagesChart';

export default class MostGrowthLanguages extends LanguagesChart {
  _calculateCustomScore(oldValue, newValue) {
    return newValue - oldValue;
  }

  _formatHintValue(hintValue) {
    return `+${hintValue}`;
  }
}
