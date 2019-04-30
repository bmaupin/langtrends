import ApiHelper from './ApiHelper';
import TopLanguagesChart from './TopLanguagesChart';
import FastestGrowingLanguagesChart from './FastestGrowingLanguagesChart';

class ChartData {
  constructor(dates, series, yDomain) {
    this._dates = dates;
    this._series = series;
    this._yDomain = yDomain;
  }

  static async fromType(chartType, interval) {
    let chart;
    let yDomain;
    switch(chartType) {
      case ChartData.CHART_TYPES.TOP_LANGUAGES:
        chart = new TopLanguagesChart(interval);
        break;
      case ChartData.CHART_TYPES.FASTEST_OVER_100:
        chart = new FastestGrowingLanguagesChart(interval, 100);
        // This reverses the y scale for the bump chart
        yDomain = [ApiHelper.NUMBER_OF_LANGUAGES, 1];
        break;
      case ChartData.CHART_TYPES.FASTEST_OVER_1000:
        chart = new FastestGrowingLanguagesChart(interval, 1000);
        yDomain = [ApiHelper.NUMBER_OF_LANGUAGES, 1];
        break;
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }

    let dates = await chart.getDates();
    let series = await chart.getSeries();

    return new ChartData(dates, series, yDomain);
  }

  get dates() {
    return this._dates;
  }

  get series() {
    return this._series;
  }

  get yDomain() {
    return this._yDomain;
  }
}

ChartData.CHART_TYPES = {
  TOP_LANGUAGES: 'toplanguages',
  FASTEST_OVER_100: 'fastestover100',
  FASTEST_OVER_1000: 'fastestover1000',
};

export default ChartData;
