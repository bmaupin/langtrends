import ApiHelper from '../helpers/ApiHelper';
import TopLanguagesChart from './TopLanguagesChart';

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
        // TODO
        // return await ApiHelper._getFastestGrowingLanguages(dates, 100);
      case ChartData.CHART_TYPES.FASTEST_OVER_1000:
        // TODO
        // return await ApiHelper._getFastestGrowingLanguages(dates, 1000);
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }

    let dates = await ApiHelper._buildDates(interval);
    let series = await chart.getSeries(chartType, dates);

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
