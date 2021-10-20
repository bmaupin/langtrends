import ApiHelper from './ApiHelper';
import settings from '../settings.json';

export default class LanguagesChart {
  constructor(interval) {
    this._interval = interval;
  }

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
    const customScoresByDate = this._getCustomScoresByDate(scoresByDate, datesForCalculations);
    const datesForChart = await this.getDates();
    const topCustomScores = await LanguagesChart._calculateTopScores(customScoresByDate, datesForChart);
    const formattedSeriesData = await this._formatDataForChart(topCustomScores, datesForChart);

    return formattedSeriesData;
  }

  // Organize scores by date so we can access each one directly
  static _organizeScoresByDate(scores) {
    let scoresByDate = {};
    for (let i = 0; i < scores.length; i++) {
      const date = scores[i].date;
      const languageName = scores[i].language.name;
      const points = scores[i].points;

      if (!scoresByDate.hasOwnProperty(date)) {
        scoresByDate[date] = {};
      }
      scoresByDate[date][languageName] = points;
    }

    return scoresByDate;
  }

  // Convert raw scores into custom scores (percentage change, score difference, etc)
  _getCustomScoresByDate(scoresByDate, datesForCalculations) {
    let customScoresByDate = {};

    // Start from 1 because the previous date is just used for calculating the custom score
    for (let i = 1; i < datesForCalculations.length; i++) {
      let date = datesForCalculations[i];
      let previousDate = datesForCalculations[i - 1];
      customScoresByDate[date] = {};

      for (let languageName in scoresByDate[date]) {
        // TODO: Filter by scores where the most recent score is above the minimum??
        // if (scoresByDate[datesForCalculations[datesForCalculations.length - 1]][languageName] > settings.minimumScore) {
        if (scoresByDate[date][languageName] > settings.minimumScore) {
          let customScore = this._calculateCustomScore(
            scoresByDate[previousDate][languageName],
            scoresByDate[date][languageName]
          );

          // percentage change could be NaN or Infinity, but react-vis can only handle numbers or null
          customScore = LanguagesChart._convertNonFiniteToNull(customScore);

          customScoresByDate[date][languageName] = customScore;
        }
      }
    }

    return customScoresByDate;
  }

  static _convertNonFiniteToNull(number) {
    if (!Number.isFinite(number)) {
      number = null;
    }
    return number;
  }

  static async _calculateTopScores(scoresByDate, dates) {
    let topScores = {};

    for (let i = 0; i < dates.length; i++) {
      let date = dates[i];
      // TODO: make this a map to guarantee order
      topScores[date] = {};

      // Sort scores so we can get the top N and do an ordinal ranking for a bump chart
      let sortedKeys = Object.keys(scoresByDate[date]).sort(function (a, b) {
        return (scoresByDate[date][b] - scoresByDate[date][a]);
      });

      for (let i = 0; i < settings.numberOfLanguages; i++) {
        let languageName = sortedKeys[i];
        topScores[date][languageName] = scoresByDate[date][languageName];
      }
    }

    return topScores;
  }

  async _formatDataForChart(topScores, dates) {
    let formattedScores = [];
    const allTopLanguages = LanguagesChart._getAllTopLanguages(topScores);

    for (let languageName of allTopLanguages) {
      formattedScores.push(
        {
          title: languageName,
          data: [],
        }
      );
    }

    for (let i = 0; i < dates.length; i++) {
      let date = dates[i];

      let formattedScoresIndex = 0;
      for (let languageName of allTopLanguages) {
        let score = null;
        let rank = null;
        if (topScores[date].hasOwnProperty(languageName)) {
          score = topScores[date][languageName];
          // TODO: this should be a map to guarantee order
          rank = Object.keys(topScores[date]).indexOf(languageName) + 1;
        }

        formattedScores[formattedScoresIndex].data.push(
          {
            x: i,
            // Use the ordinal number ranking for the chart data in order to create a bump chart
            y: rank,
            // TODO: don't add hintTitle and hintValue if score is null
            hintTitle: languageName,
            // Add the custom score as a separate property so it can be used for hints on mouseover
            hintValue: this._formatHintValue(score),
          }
        );
        formattedScoresIndex ++;
      }
    }

    return formattedScores;
  }

  static _getAllTopLanguages(topScores) {
    let allTopLanguages = [];

    for (let date in topScores) {
      for (let languageName in topScores[date]) {
        if (!allTopLanguages.includes(languageName)) {
          allTopLanguages.push(languageName);
        }
      }
    }

    return allTopLanguages;
  }
}
