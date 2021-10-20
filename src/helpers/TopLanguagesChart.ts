import LanguagesChart from './LanguagesChart';

export default class TopLanguagesChart extends LanguagesChart {
  _calculateCustomScore(_oldValue, newValue) {
    return newValue;
  }

  _formatHintValue(hintValue) {
    return hintValue;
  }
}
