import TopLanguagesChart from './TopLanguagesChart';
import FastestGrowingLanguagesChart from './FastestGrowingLanguagesChart';
import MostGrowthLanguages from './MostGrowthLanguages';

class ChartData {
  constructor(dates, series) {
    this._dates = dates;
    this._series = series;
  }

  static async fromType(chartType, interval) {
    let chart;
    switch(chartType) {
      case ChartData.CHART_TYPES.FASTEST_GROWTH:
        chart = new FastestGrowingLanguagesChart(interval, 1000);
        break;
      case ChartData.CHART_TYPES.MOST_GROWTH:
        chart = new MostGrowthLanguages(interval, 1000);
        break;
      case ChartData.CHART_TYPES.TOP_LANGUAGES:
        chart = new TopLanguagesChart(interval);
        break;
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }

    let dates = await chart.getDates();
    let series = await chart.getSeries();

    return new ChartData(dates, series);
  }

  get dates() {
    return this._dates;
  }

  get series() {
    return this._series;
  }
}

ChartData.CHART_TYPES = {
  FASTEST_GROWTH: 'fastestgrowth',
  MOST_GROWTH: 'mostgrowth',
  TOP_LANGUAGES: 'toplanguages',
};

export default ChartData;
