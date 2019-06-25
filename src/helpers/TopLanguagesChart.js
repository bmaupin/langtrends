import ApiHelper from './ApiHelper';
import LanguagesChart from './LanguagesChart';

export default class TopLanguagesChart extends LanguagesChart {
  constructor(interval) {
    super();

    this._interval = interval;
  }

  async getDates() {
    if (typeof this._dates === 'undefined') {
      let dates = await ApiHelper.buildDates(this._interval);
      // From this point on we only need the date as a string
      this._dates = dates.map(date => date.toISOString());
    }

    return this._dates;
  }

  async getSeries() {
    const dates = await this.getDates();
    const scoresFromApi = await ApiHelper.getAllScores(dates);
    const scoresByDate = LanguagesChart._organizeScoresByDate(scoresFromApi);
    const topScores = await LanguagesChart._calculateTopScores(dates, scoresByDate);
    const formattedSeriesData = await this._formatDataForChart(dates, topScores);

    return formattedSeriesData;
  }
}
