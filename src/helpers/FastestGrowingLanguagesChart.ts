import LanguagesChart from './LanguagesChart';

export default class FastestGrowingLanguagesChart extends LanguagesChart {
  calculateCustomScore(oldValue: number, newValue: number) {
    return (newValue / oldValue) * 100;
  }

  formatHintValue(hintValue: number): string {
    return `${Math.round(hintValue)}% growth`;
  }
}
