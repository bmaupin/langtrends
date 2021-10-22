import LanguagesChart from './LanguagesChart';

export default class TopLanguagesChart extends LanguagesChart {
  calculateCustomScore(_oldValue: number, newValue: number) {
    return newValue;
  }

  formatHintValue(hintValue: number): string {
    return String(hintValue);
  }
}
