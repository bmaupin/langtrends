import LanguagesChart from './LanguagesChart';

export default class MostGrowthLanguages extends LanguagesChart {
  protected calculateCustomScore(oldValue: number, newValue: number) {
    return newValue - oldValue;
  }

  protected formatHintValue(hintValue: number): string {
    return `+${hintValue}`;
  }
}
