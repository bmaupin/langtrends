import LanguagesChart from './LanguagesChart';

export default class FastestGrowingLanguagesChart extends LanguagesChart {
  protected calculateCustomScore(oldValue: number, newValue: number) {
    return (newValue / oldValue) * 100;
  }

  protected formatHintValue(hintValue: number): string {
    return `${Math.round(hintValue)}% growth`;
  }
}
