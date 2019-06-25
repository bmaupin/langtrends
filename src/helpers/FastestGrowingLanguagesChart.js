import ApiHelper from './ApiHelper';
import LanguagesChart from './LanguagesChart';

export default class FastestGrowingLanguagesChart extends LanguagesChart {
  constructor(interval, minimumScore) {
    super();

    this._interval = interval;
    this._minimumScore = minimumScore;
  }

  async getDates() {
    // We need one extra date internally for calculations, so to avoid extra API calls just drop the extra date
    return (await this._getDatesForCalculations()).slice(1);
  }

  async _getDatesForCalculations() {
    if (typeof this._dates === 'undefined') {
      let dates = await ApiHelper.buildDates(this._interval, ApiHelper.NUMBER_OF_DATES + 1);
      // From this point on we only need the date as a string
      this._dates = dates.map(date => date.toISOString());
    }

    return this._dates;
  }

  async getSeries() {
    const datesForCalculations = await this._getDatesForCalculations();
    const scoresFromApi = await ApiHelper.getAllScores(datesForCalculations);
    const scoresByDate = LanguagesChart._organizeScoresByDate(scoresFromApi);
    const percentageChangesByDate = this._getPercentageChangesByDate(scoresByDate, datesForCalculations);
    const datesForChart = await this.getDates();
    const topPercentageChanges = await LanguagesChart._calculateTopScores(percentageChangesByDate, datesForChart);
    const formattedSeriesData = await this._formatDataForChart(topPercentageChanges, datesForChart);

    return formattedSeriesData;
  }

  _getPercentageChangesByDate(scoresByDate, datesForCalculations) {
    let percentageChangesByDate = {};

    // Start from 1 because the previous date is just used for calculating the percentage change
    for (let i = 1; i < datesForCalculations.length; i++) {
      let date = datesForCalculations[i];
      let previousDate = datesForCalculations[i - 1];
      percentageChangesByDate[date] = {};

      for (let languageName in scoresByDate[date]) {
        // TODO: Filter by scores where the most recent score is above the minimum??
        // if (scoresByDate[datesForCalculations[datesForCalculations.length - 1]][languageName] > this._minimumScore) {
        if (scoresByDate[date][languageName] > this._minimumScore) {
          let percentageChange = FastestGrowingLanguagesChart._calculatePercentageChange(
            scoresByDate[previousDate][languageName],
            scoresByDate[date][languageName]
          );

          // percentageChange could be NaN or Infinity, but react-vis can only handle numbers or null
          percentageChange = FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChange);

          percentageChangesByDate[date][languageName] = percentageChange;
        }
      }
    }

    return percentageChangesByDate;
  }

  static _calculatePercentageChange(oldValue, newValue) {
    return newValue / oldValue * 100;
  }

  static _convertNonFiniteToNull(number) {
    if (!Number.isFinite(number)) {
      number = null;
    }
    return number;
  }

  _formatHintValue(hintValue) {
    return `${Math.round(hintValue)}% growth`;
  }
}
