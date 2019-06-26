import ApiHelper from './ApiHelper';
import LanguagesChart from './LanguagesChart';
import settings from '../settings.json';

export default class MostGrowthLanguages extends LanguagesChart {
  async getDates() {
    // We need one extra date internally for calculations, so to avoid extra API calls just drop the extra date
    return (await this._getDatesForCalculations()).slice(1);
  }

  async _getDatesForCalculations() {
    if (typeof this._dates === 'undefined') {
      let dates = await ApiHelper.buildDates(this._interval, settings.numberOfDates + 1);
      // From this point on we only need the date as a string
      this._dates = dates.map(date => date.toISOString());
    }

    return this._dates;
  }

  async getSeries() {
    const datesForCalculations = await this._getDatesForCalculations();
    const scoresFromApi = await ApiHelper.getAllScores(datesForCalculations);
    const scoresByDate = LanguagesChart._organizeScoresByDate(scoresFromApi);
    const growthByDate = this._getGrowthByDate(scoresByDate, datesForCalculations);
    const datesForChart = await this.getDates();
    const topGrowth = await LanguagesChart._calculateTopScores(growthByDate, datesForChart);
    const formattedSeriesData = await this._formatDataForChart(topGrowth, datesForChart);

    return formattedSeriesData;
  }

  _getGrowthByDate(scoresByDate, datesForCalculations) {
    let growthByDate = {};

    // Start from 1 because the previous date is just used for calculating the growth
    for (let i = 1; i < datesForCalculations.length; i++) {
      let date = datesForCalculations[i];
      let previousDate = datesForCalculations[i - 1];
      growthByDate[date] = {};

      for (let languageName in scoresByDate[date]) {
        if (scoresByDate[date][languageName] > settings.minimumScore) {
          let growth = MostGrowthLanguages._calculateGrowth(
            scoresByDate[previousDate][languageName],
            scoresByDate[date][languageName]
          );

          growthByDate[date][languageName] = growth;
        }
      }
    }

    return growthByDate;
  }

  static _calculateGrowth(oldValue, newValue) {
    return newValue - oldValue;
  }

  _formatHintValue(hintValue) {
    return `+${hintValue}`;
  }
}
