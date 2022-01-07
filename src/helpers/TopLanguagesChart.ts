import LanguagesChart from './LanguagesChart';

export default class TopLanguagesChart extends LanguagesChart {
  protected calculateCustomScore(_oldValue: number, newValue: number) {
    return newValue;
  }

  protected formatTooltipValue(tooltipValue: number): string {
    return String(tooltipValue);
  }
}
