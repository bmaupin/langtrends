import ApiHelper from '../helpers/ApiHelper';
import TopLanguagesChart from './TopLanguagesChart';

const NUMBER_OF_DATES = 12;

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

    let dates = await ChartData._buildDates(interval);
    let series = await ChartData._getSeries(chart, dates);
    // let series = await chart.getSeries(dates);

    return new ChartData(dates, series);
  }

  static async _buildDates(intervalInMonths) {
    let dates = [];
    let currentDate = await ApiHelper._getLatestDateFromApi();

    for (let i = 0; i < NUMBER_OF_DATES; i++) {
      dates.push(currentDate);
      currentDate = ApiHelper._subtractMonthsUTC(currentDate, intervalInMonths);
    }

    return dates.reverse();
  }

  static async _getSeries(chart, dates) {
    let languages = await chart.getLanguages(dates);
    let apiFilter = ApiHelper._buildSeriesApiFilter(languages, dates);
    let scoresFromApi = await ApiHelper._callApi(apiFilter);
    let formattedSeriesData = chart.formatDataForChart(languages, scoresFromApi);

    return formattedSeriesData;
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
