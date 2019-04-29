import ApiHelper from './ApiHelper';

export default class FastestGrowingLanguagesChart {
  constructor(interval, minimumScore) {
    this._interval = interval;
    this._minimumScore = minimumScore;
  }

  async getDates() {
    // We need one extra date internally for calculations, so to avoid extra API calls just drop the extra date
    return (await this._getDatesForCalculations()).slice(1);
  }

  async _getDatesForCalculations() {
    if (typeof this._dates === 'undefined') {
      this._dates = await ApiHelper.buildDates(this._interval, ApiHelper.NUMBER_OF_DATES + 1);
    }
    // TODO: map this using .toISOString() so we don't have to call it everywhere we use the dates
    return this._dates;
  }

  async getSeries() {
    const datesForCalculations = await this._getDatesForCalculations();
    const scoresFromApi = await FastestGrowingLanguagesChart._getAllScores(datesForCalculations);
    const scoresByDate = FastestGrowingLanguagesChart._organizeScoresByDate(scoresFromApi);
    const percentageChangesByDate = this._getPercentageChangesByDate(scoresByDate, datesForCalculations);
    const topPercentageChanges = await this._calculateTopPercentageChanges(percentageChangesByDate);
    const formattedSeriesData = await this._formatDataForChart(topPercentageChanges);

    return formattedSeriesData;
  }

  static async _getAllScores(dates) {
    const apiFilter = {
      where: {
        or: dates.map(date => ({ date: date.toISOString() }))
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
    };

    return await ApiHelper.callApi(apiFilter);
  }

  // Organize scores by date so we can access each one directly
  static _organizeScoresByDate(scores) {
    let scoresByDate = {};
    for (let i = 0; i < scores.length; i++) {
      // This date comes directly from the API as a string, so no need to call .toISOString() on it
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

  _getPercentageChangesByDate(scoresByDate, datesForCalculations) {
    let percentageChangesByDate = {};

    // Start from 1 because the previous date is just used for calculating the percentage change
    for (let i = 1; i < datesForCalculations.length; i++) {
      let date = datesForCalculations[i].toISOString();
      let previousDate = datesForCalculations[i - 1].toISOString();
      percentageChangesByDate[date] = {};

      for (let languageName in scoresByDate[date]) {
        // TODO: Filter by scores where the most recent score is above the minimum??
        // if (scoresByDate[datesForCalculations[datesForCalculations.length - 1].toISOString()][languageName] > this._minimumScore) {
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

  async _calculateTopPercentageChanges(percentageChangesByDate) {
    const datesForChart = await this.getDates();
    let topPercentageChanges = {};

    for (let i = 0; i < datesForChart.length; i++) {
      let date = datesForChart[i].toISOString();
      // TODO: make this a map to guarantee order
      topPercentageChanges[date] = {};

      // Sort percentage changes so we can get the top N and do an ordinal ranking for a bump chart
      let sortedKeys = Object.keys(percentageChangesByDate[date]).sort(function (a, b) {
        return (percentageChangesByDate[date][b] - percentageChangesByDate[date][a]);
      });

      for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
        let languageName = sortedKeys[i];
        topPercentageChanges[date][languageName] = percentageChangesByDate[date][languageName];
      }
    }

    return topPercentageChanges;
  }

  async _formatDataForChart(topPercentageChanges) {
    let formattedScores = [];
    const allFastestGrowingLanguages = FastestGrowingLanguagesChart._getAllFastestGrowingLanguages(topPercentageChanges);

    for (let languageName of allFastestGrowingLanguages) {
      formattedScores.push(
        {
          title: languageName,
          data: [],
        }
      );
    }

    let datesForChart = await this.getDates();
    for (let i = 0; i < datesForChart.length; i++) {
      let date = datesForChart[i].toISOString();

      let formattedScoresIndex = 0;
      for (let languageName of allFastestGrowingLanguages) {
        let percentageChange = null;
        let rank = null;
        if (topPercentageChanges[date].hasOwnProperty(languageName)) {
          percentageChange = topPercentageChanges[date][languageName];
          // TODO: this should be a map to guarantee order
          rank = Object.keys(topPercentageChanges[date]).indexOf(languageName) + 1;
        }

        formattedScores[formattedScoresIndex].data.push(
          {
            x: i,
            // Use the ordinal number ranking for the chart data in order to create a bump chart
            y: rank,
            // TODO: don't add hintTitle and hintValue if rank/percentageChange is null
            hintTitle: languageName,
            // Add the actual percentage change as a separate property so it can be used for hints on mouseover
            hintValue: `${Math.round(percentageChange)}% growth`,
          }
        );
        formattedScoresIndex ++;
      }
    }

    return formattedScores;
  }

  static _getAllFastestGrowingLanguages(topPercentageChanges) {
    let allFastestGrowingLanguages = [];

    for (let date in topPercentageChanges) {
      for (let languageName in topPercentageChanges[date]) {
        if (!allFastestGrowingLanguages.includes(languageName)) {
          allFastestGrowingLanguages.push(languageName);
        }
      }
    }

    return allFastestGrowingLanguages;
  }
}
