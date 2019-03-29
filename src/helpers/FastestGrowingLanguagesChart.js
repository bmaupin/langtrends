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
    return this._dates;
  }

  async getSeries() {
    const languages = await this._getLanguages();
    const scoresForSeries = await ApiHelper.getScoresForSeries(languages, await this._getDatesForCalculations());
    let formattedSeriesData = await this._convertAndFormatScores(languages, scoresForSeries);

    return formattedSeriesData;
  }

  async _getLanguages() {
    let [nextToLastDate, lastDate] = (await this._getDatesForCalculations()).slice(-2);
    let scoresForLastTwoDates = await FastestGrowingLanguagesChart._getAllScores([lastDate, nextToLastDate]);

    let scoresByLanguage = {};
    let languageNamesById = {};
    for (let i = 0; i < scoresForLastTwoDates.length; i++) {
      const date = scoresForLastTwoDates[i].date;
      const languageId = scoresForLastTwoDates[i].languageId;
      const languageName = scoresForLastTwoDates[i].language.name;
      const points = scoresForLastTwoDates[i].points;

      if (!scoresByLanguage.hasOwnProperty(languageId)) {
        scoresByLanguage[languageId] = {};
        languageNamesById[languageId] = languageName;
      }

      scoresByLanguage[languageId][date] = points;
    }

    let scorePercentageChanges = {};
    for (let langaugeId in scoresByLanguage) {
      if (scoresByLanguage[langaugeId][lastDate.toISOString()] > this._minimumScore) {
        scorePercentageChanges[langaugeId] = FastestGrowingLanguagesChart._calculatePercentageChange(
          scoresByLanguage[langaugeId][nextToLastDate.toISOString()],
          scoresByLanguage[langaugeId][lastDate.toISOString()]
        );
      }
    }

    let fastestGrowingLanguageIds = Object.keys(scorePercentageChanges).sort((a, b) => {
      return scorePercentageChanges[b] - scorePercentageChanges[a];
    });

    // Use a Map because it is guaranteed to maintain order (unlike a plain object)
    let fastestGrowingLanguages = new Map();
    for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
      fastestGrowingLanguages.set(fastestGrowingLanguageIds[i], languageNamesById[fastestGrowingLanguageIds[i]]);
    }

    return fastestGrowingLanguages;
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

  static _calculatePercentageChange(oldValue, newValue) {
    return newValue / oldValue * 100;
  }

  // Convert the data from raw scores into percentage changes and format for the chart
  async _convertAndFormatScores(languages, scores) {
    let scoresByLanguage = FastestGrowingLanguagesChart._organizeScoresByLanguage(scores);
    let datesForCalculations = await this._getDatesForCalculations();
    let percentageChangesByDate = await this._getPercentageChangesByDate(scoresByLanguage, datesForCalculations);

    return this._formatDataForChart(languages, percentageChangesByDate, datesForCalculations);
  }

  // Organize scores by language so we can access each one directly
  static _organizeScoresByLanguage(scores) {
    let scoresByLanguage = {};
    for (let i = 0; i < scores.length; i++) {
      const date = scores[i].date;
      const languageName = scores[i].language.name;
      const points = scores[i].points;

      if (!scoresByLanguage.hasOwnProperty(languageName)) {
        scoresByLanguage[languageName] = {};
      }
      scoresByLanguage[languageName][date] = points;
    }

    return scoresByLanguage;
  }

  async _getPercentageChangesByDate(scoresByLanguage, datesForCalculations) {
    let percentageChangesByDate = {};
    for (let languageName in scoresByLanguage) {
      // Start from 1 because the previous language is just used for calculating the percentage change
      for (let i = 1; i < datesForCalculations.length; i++) {
        let date = datesForCalculations[i].toISOString();
        let previousDate = datesForCalculations[i - 1].toISOString();

        let percentageChange = FastestGrowingLanguagesChart._calculatePercentageChange(
          scoresByLanguage[languageName][previousDate],
          scoresByLanguage[languageName][date]
        );

        // percentageChange could be NaN or Infinity, but react-vis can only handle numbers or null
        percentageChange = FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChange);

        if (!percentageChangesByDate.hasOwnProperty(date)) {
          percentageChangesByDate[date] = {};
        }
        percentageChangesByDate[date][languageName] = percentageChange;
      }
    }

    return percentageChangesByDate;
  }

  static _convertNonFiniteToNull(number) {
    if (!Number.isFinite(number)) {
      number = null;
    }
    return number;
  }

  _formatDataForChart(languages, percentageChangesByDate, datesForCalculations) {
    let formattedScores = [];
    for (let languageName of languages.values()) {
      formattedScores.push(
        {
          title: languageName,
          data: [],
        }
      );
    }

    // Start from 1 because the previous language is just used for calculating the score
    for (let i = 1; i < datesForCalculations.length; i++) {
      let date = datesForCalculations[i].toISOString();
      // Sort percentage changes so we can do an ordinal ranking for a bump chart
      let sortedKeys = Object.keys(percentageChangesByDate[date]).sort(function (a, b) {
        return (percentageChangesByDate[date][b] - percentageChangesByDate[date][a]);
      });

      let formattedScoresIndex = 0;
      for (let languageName of languages.values()) {
        let percentageChange = percentageChangesByDate[date][languageName];
        let rank = sortedKeys.indexOf(languageName) + 1;
        if (percentageChange === null) {
          rank = null;
        }

        formattedScores[formattedScoresIndex].data.push(
          {
            x: i - 1,
            // Use the ordinal number ranking for the chart data in order to create a bump chart
            y: rank,
            // Put the actual percentage change in the detailed crosshair table on mouseover
            crosshairValue: `${Math.round(percentageChange)}%`,
          }
        );
        formattedScoresIndex ++;
      }
    }

    return formattedScores;
  }
}
