import LanguagesChart from './LanguagesChart';

export default class TopLanguagesChart extends LanguagesChart {
  protected calculateCustomScore(_oldValue: number, newValue: number) {
    return newValue;
  }

  protected formatHintValue(hintValue: number): string {
    return String(hintValue);
  }
}
