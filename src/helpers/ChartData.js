import TopLanguagesChart from './TopLanguagesChart';
import FastestGrowingLanguagesChart from './FastestGrowingLanguagesChart';

class ChartData {
  constructor(dates, series) {
    this._dates = dates;
    this._series = series;
  }

  static async fromType(chartType, interval) {
    let chart;
    switch(chartType) {
      case ChartData.CHART_TYPES.TOP_LANGUAGES:
        chart = new TopLanguagesChart(interval);
        break;
      case ChartData.CHART_TYPES.FASTEST_OVER_100:
        chart = new FastestGrowingLanguagesChart(interval, 100);
        break;
      case ChartData.CHART_TYPES.FASTEST_OVER_1000:
        chart = new FastestGrowingLanguagesChart(interval, 1000);
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

// Note: the string values are also used for the labels in the UI menu
ChartData.CHART_TYPES = {
  TOP_LANGUAGES: 'Top',
  FASTEST_OVER_100: 'Fastest growing over 100',
  FASTEST_OVER_1000: 'Fastest growing over 1000',
};

export default ChartData;
