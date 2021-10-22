import LanguagesChart from './LanguagesChart';

export default class MostGrowthLanguages extends LanguagesChart {
  calculateCustomScore(oldValue: number, newValue: number) {
    return newValue - oldValue;
  }

  formatHintValue(hintValue: number): string {
    return `+${hintValue}`;
  }
}
