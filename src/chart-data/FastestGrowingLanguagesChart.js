import ApiHelper from '../helpers/ApiHelper';
import LanguagesChart from './LanguagesChart';

export default class FastestGrowingLanguagesChart extends LanguagesChart {
  constructor(minimumScore) {
    super();

    this._minimumScore = minimumScore;
  }

  async getLanguages(dates) {
    let [nextToLastDate, lastDate] = dates.slice(dates.length - 2, dates.length);
    let scoresForLastTwoDates = await FastestGrowingLanguagesChart._getScoresForDates([lastDate, nextToLastDate]);

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

    let fastestGrowingLanguageIds = Object.keys(scorePercentageChanges).sort((a,b) => {
      return scorePercentageChanges[b] - scorePercentageChanges[a];
    });

    // Use a Map because it is guaranteed to maintain order (unlike a plain object)
    let fastestGrowingLanguages = new Map();
    for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
      fastestGrowingLanguages.set(fastestGrowingLanguageIds[i], languageNamesById[fastestGrowingLanguageIds[i]]);
    }

    return fastestGrowingLanguages;
  }

  static async _getScoresForDates(dates) {
    const apiFilter = {
      where: {
        or: dates.map(date => ({date: date.toISOString()}))
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
    };

    return await ApiHelper._callApi(apiFilter);
  }

  // formatDataForChart(languages, scores) {
  //   console.log(`scores=${JSON.stringify(scores)}`)

  //   let formattedScores = [];

  //   languages.forEach(languageName => {
  //     formattedScores.push(
  //       {
  //         title: languageName,
  //         data: [],
  //       }
  //     );
  //   });

  //   for (let i = 0; i < scores.length; i++) {
  //     const languageName = scores[i].language.name;
  //     const points = scores[i].points;

  //     let languageData = formattedScores.find(languageData => languageData.title === languageName);

  //     languageData.data.push(
  //       {
  //         x: languageData.data.length,
  //         y: points,
  //       }
  //     )
  //   }

  //   return formattedScores;
  // }

  // TODO: use percentage instead of score
  formatDataForChart(languages, scores) {
    let intermediateScoreData = this._intermediateFormatScores(scores);

    let formattedScores = [];

    languages.forEach(languageName => {
      let languageData = [];

      for (let i = 0; i < intermediateScoreData[languageName].length; i++) {
        languageData.push(
          {
            x: i,
            y: intermediateScoreData[languageName][i],
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

    // for (let i = 0; i < scores.length; i++) {
    //   const languageName = scores[i].language.name;
    //   const points = scores[i].points;

    //   let languageData = formattedScores.find(languageData => languageData.title === languageName);

    //   languageData.data.push(
    //     {
    //       x: languageData.data.length,
    //       y: points,
    //     }
    //   )
    // }

    return formattedScores;
  }

  _intermediateFormatScores(scores) {
    // intermediate format: calculatedData = {'languagename': [score, score], 'languagename': [score, score]}

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

  /*
    - For each date in the list of dates (starting with index 1)
      - Get the languageData
      - Calculate score: scores[language][dates[i]] / scores[language][dates[i] - 1] / 100
      - languageData.push(score)
  */
}
