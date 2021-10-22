import TopLanguagesChart from './TopLanguagesChart';
import FastestGrowingLanguagesChart from './FastestGrowingLanguagesChart';
import MostGrowthLanguages from './MostGrowthLanguages';

export enum ChartType {
  FastestGrowth = 'FASTEST_GROWTH',
  MostGrowth = 'MOST_GROWTH',
  TopLanguages = 'TOP_LANGUAGES',
}

export default class ChartFactory {
  static async fromType(chartType: string, interval: number) {
    let chart;
    switch (chartType) {
      case ChartType.FastestGrowth:
        chart = new FastestGrowingLanguagesChart(interval);
        break;
      case ChartType.MostGrowth:
        chart = new MostGrowthLanguages(interval);
        break;
      case ChartType.TopLanguages:
        chart = new TopLanguagesChart(interval);
        break;
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }

    return chart;
  }
}
