import ApiHelper from './ApiHelper';
import LanguagesChart from './LanguagesChart';

export default class FastestGrowingLanguagesChart extends LanguagesChart {
  constructor(minimumScore, interval) {
    super();

    this._interval = interval;
    this._minimumScore = minimumScore;
  }

  async getSeries(dates) {
    const languages = await this._getLanguages(dates);
    const datesForScores = await ApiHelper.buildDates(this._interval, ApiHelper.NUMBER_OF_DATES + 1);
    const scoresForSeries = await ApiHelper.getScoresForSeries(languages, datesForScores);
    let formattedSeriesData = this._formatDataForChart(languages, scoresForSeries);

    return formattedSeriesData;
  }

  async _getLanguages(dates) {
    let [nextToLastDate, lastDate] = dates.slice(dates.length - 2, dates.length);
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
      if (scoresByLanguage[langaugeId][nextToLastDate.toISOString()] > this._minimumScore) {
        scorePercentageChanges[langaugeId] = (
          scoresByLanguage[langaugeId][lastDate.toISOString()] /
          scoresByLanguage[langaugeId][nextToLastDate.toISOString()] * 100
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

  _formatDataForChart(languages, scores) {
    let intermediateScoreData = this._intermediateFormatScores(scores);

    let formattedScores = [];
    languages.forEach(languageName => {
      let languageData = [];

      // Start from 1 because the previous language is just used for calculating the score
      for (let i = 1; i < intermediateScoreData[languageName].length; i++) {
        let percentageGrowth = intermediateScoreData[languageName][i] / intermediateScoreData[languageName][i - 1] * 100;
        // percentageGrowth could be NaN or Infinity
        if (!Number.isFinite(percentageGrowth)) {
          percentageGrowth = null;
        }

        languageData.push(
          {
            x: i - 1,
            y: percentageGrowth,
          }
        );
      }

      formattedScores.push(
        {
          title: languageName,
          data: languageData,
        }
      );
    });

    return formattedScores;
  }

  _intermediateFormatScores(scores) {
    let intermediateScoreData = {};
    for (let i = 0; i < scores.length; i++) {
      const languageName = scores[i].language.name;
      const points = scores[i].points;

      if (!intermediateScoreData.hasOwnProperty(languageName)) {
        intermediateScoreData[languageName] = [];
      }
      intermediateScoreData[languageName].push(points);
    }

    return intermediateScoreData;
  }
}
