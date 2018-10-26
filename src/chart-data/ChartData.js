import ApiHelper from '../helpers/ApiHelper';
import TopLanguagesChart from './TopLanguagesChart';
import FastestGrowingLanguagesChart from './FastestGrowingLanguagesChart';

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
        chart = new FastestGrowingLanguagesChart(100);
        break;
      case ChartData.CHART_TYPES.FASTEST_OVER_1000:
        chart = new FastestGrowingLanguagesChart(1000);
        break;
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }

    chart = new FastestGrowingLanguagesChart(1000);

    let dates = await ChartData._buildDates(interval);
    let series = await ChartData._getSeries(chart, dates);
    // let series = await chart.getSeries(dates);

    // TODO: remove this
    console.log(`SERIES=${JSON.stringify(series)}`)
    new FastestGrowingLanguagesChart(1000).getLanguages(dates);

    return new ChartData(dates, series);
  }

  static async _buildDates(intervalInMonths, numberOfDates = NUMBER_OF_DATES) {
    let dates = [];
    let currentDate = await ApiHelper._getLatestDateFromApi();

    for (let i = 0; i < numberOfDates; i++) {
      dates.push(currentDate);
      currentDate = ChartData._subtractMonthsUTC(currentDate, intervalInMonths);
    }

    return dates.reverse();
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }

  static async _getSeries(chart, dates) {
    let languages = await chart.getLanguages(dates);
    let scoresFromApi = await ChartData._getScoresForSeries(languages, dates);
    let formattedSeriesData = chart.formatDataForChart(languages, scoresFromApi);

    return formattedSeriesData;
  }

  static async _getScoresForSeries(languages, dates) {
    const apiFilter = {
      where: {
        and: [
          {
            or: Array.from(languages.keys()).map(languageId => ({languageId: languageId}))
          },
          {
            or: dates.map(date => ({date: date.toISOString()}))
          }
        ]
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
      // The methods that work with this data will assume that it's ordered by date
      order: 'date ASC',
    };

    return await ApiHelper._callApi(apiFilter);
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
