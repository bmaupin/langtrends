import ApiHelper from '../helpers/ApiHelper';
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
        chart = new TopLanguagesChart();
        break;
      case ChartData.CHART_TYPES.FASTEST_OVER_100:
        chart = new FastestGrowingLanguagesChart(100, interval);
        break;
      case ChartData.CHART_TYPES.FASTEST_OVER_1000:
        chart = new FastestGrowingLanguagesChart(1000, interval);
        break;
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }

    let dates = await ApiHelper.buildDates(interval);
    let series = await chart.getSeries(dates);

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
  TOP_LANGUAGES: 'toplanguages',
  FASTEST_OVER_100: 'fastestover100',
  FASTEST_OVER_1000: 'fastestover1000',
};

export default ChartData;
