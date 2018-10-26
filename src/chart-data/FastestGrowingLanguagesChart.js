import ApiHelper from '../helpers/ApiHelper';
import LanguagesChart from './LanguagesChart';

export default class FastestGrowingLanguagesChart extends LanguagesChart {
  constructor(minimumScore) {
    super();

    this._minimumScore = minimumScore;
  }

  async getLanguages1(dates) {
    let [nextToLastDate, lastDate] = dates.slice(dates.length - 2, dates.length);
    let scoresForLastTwoDates = await FastestGrowingLanguagesChart._getScoresForDates([lastDate, nextToLastDate]);

    let scoresPerLanguage = {};

    for (let i = 0; i < scoresForLastTwoDates.length; i++) {
      const languageId = scoresForLastTwoDates[i].languageId;
      const languageName = scoresForLastTwoDates[i].language.name;
      const date = scoresForLastTwoDates[i].date;
      const points = scoresForLastTwoDates[i].points;

      if (!scoresPerLanguage.hasOwnProperty(languageId)) {
        scoresPerLanguage[languageId] = {};
        scoresPerLanguage[languageId].languageName = languageName;
        scoresPerLanguage[languageId].scores = {};
      }

      scoresPerLanguage[languageId].scores[date] = points;

      if (Object.keys(scoresPerLanguage[languageId].scores).length === 2) {
        if (scoresPerLanguage[languageId].scores[nextToLastDate.toISOString()] > this._minimumScore) {
          scoresPerLanguage[languageId].percentageChange = (
            scoresPerLanguage[languageId].scores[lastDate.toISOString()] /
            scoresPerLanguage[languageId].scores[nextToLastDate.toISOString()] * 100
          );
        } else {
          scoresPerLanguage[languageId].percentageChange = 0;
        }
      }
    }

    let fastestGrowingLanguageIds = Object.keys(scoresPerLanguage).sort((a,b) => {
      return scoresPerLanguage[b].percentageChange - scoresPerLanguage[a].percentageChange;
    });

    let fastestGrowingLanguages = new Map();
    for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
      const languageId = fastestGrowingLanguageIds[i];
      fastestGrowingLanguages.set(languageId, scoresPerLanguage[languageId].languageName);
    }

    return fastestGrowingLanguages;
  }

  // TODO: pick an algorithm :)
  async getLanguages(dates) {
    return await this.getLanguages1(dates)
  }

  async getLanguages2(dates) {
    let [nextToLastDate, lastDate] = dates.slice(dates.length - 2, dates.length);
    let scores = await FastestGrowingLanguagesChart._getScoresForDates([lastDate, nextToLastDate]);

    let scoresByLanguage = {};
    let languageNames = {};
    for (let i = 0; i < scores.length; i++) {
      const date = scores[i].date;
      const languageId = scores[i].languageId;
      const languageName = scores[i].language.name;
      const points = scores[i].points;

      if (!scoresByLanguage.hasOwnProperty(languageId)) {
        scoresByLanguage[languageId] = {};
        languageNames[languageId] = languageName;
      }

      scoresByLanguage[languageId][date] = points;
    }

    let scoreDifferences = {};
    for (let langaugeId in scoresByLanguage) {
      if (scoresByLanguage[langaugeId][nextToLastDate.toISOString()] > this._minimumScore) {
        scoreDifferences[langaugeId] = (
          scoresByLanguage[langaugeId][lastDate.toISOString()] /
          scoresByLanguage[langaugeId][nextToLastDate.toISOString()] * 100
        );
      }
    }

    let sortedScores = Object.keys(scoreDifferences).sort((a,b) => {return scoreDifferences[b] - scoreDifferences[a];});

    let fastestGrowingLanguages = new Map();
    for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
      fastestGrowingLanguages.set(sortedScores[i], languageNames[sortedScores[i]]);
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
