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
    let formattedSeriesData = this._formatDataForChart(languages, scoresForSeries);
    // TODO
    let formattedSeriesDataNew = await this._formatDataForChartNew(languages, scoresForSeries)
    console.log(`formattedSeriesData1=${JSON.stringify(formattedSeriesData)}`)
    console.log(`formattedSeriesData2=${JSON.stringify(formattedSeriesDataNew)}`)

    return formattedSeriesDataNew;
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

  _formatDataForChart(languages, scores) {
    let intermediateScoreData = this._intermediateFormatScores(scores);

    // console.log(`intermediateScoreData=${JSON.stringify(intermediateScoreData)}`)

    let formattedScores = [];
    languages.forEach(languageName => {
      let languageData = [];

      // Start from 1 because the previous language is just used for calculating the score
      for (let i = 1; i < intermediateScoreData[languageName].length; i++) {
        let percentageChange = FastestGrowingLanguagesChart._calculatePercentageChange(
          intermediateScoreData[languageName][i - 1],
          intermediateScoreData[languageName][i]
        );
        // percentageChange could be NaN or Infinity
        percentageChange = FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChange);

        languageData.push(
          {
            x: i - 1,
            y: percentageChange,
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
    console.log(scores)

    let intermediateScoreData = {};
    for (let i = 0; i < scores.length; i++) {
      const languageName = scores[i].language.name;
      const points = scores[i].points;

      if (!intermediateScoreData.hasOwnProperty(languageName)) {
        intermediateScoreData[languageName] = [];
      }
      intermediateScoreData[languageName].push(points);
    }

    // console.log(intermediateScoreData)

    return intermediateScoreData;
  }

/*
- calculate percentage change
  - for each language
    - for each date
      - calculate the percentage change and store it
- for each date
  - sort all the percentage changes for that date
    - use that to build the new chart



- first pass
  - organize scores by language so we can access each one directly
- second pass
  - calculate percentage change for each language
- third pass
  - for each date, sort percentage changes
- fourth pass
  - put into proper format for chart

*/

  async _getPercentageChangesByDate(scoresByLanguage, datesForCalculations) {
    let percentageChangesByDate = {};
    for (let languageName in scoresByLanguage) {
      for (let i = 1; i < datesForCalculations.length; i++) {
        let date = datesForCalculations[i].toISOString();
        let previousDate = datesForCalculations[i - 1].toISOString();

        let percentageChange = FastestGrowingLanguagesChart._calculatePercentageChange(
          scoresByLanguage[languageName][previousDate],
          scoresByLanguage[languageName][date]
        );

        // percentageChange could be NaN or Infinity
        percentageChange = FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChange);

        // TODO
        // if (!percentageChangesByLanguage.hasOwnProperty(languageName)) {
        //   percentageChangesByLanguage[languageName] = {};
        // }
        // // scoresByLanguage[languageName].push(points);
        // percentageChangesByLanguage[languageName][datesForCalculations[i].toISOString()] = percentageChange;

        // if (!percentageChangesByDate.hasOwnProperty(date)) {
        //   percentageChangesByDate[date] = [];
        // }
        // percentageChangesByDate[date].push([languageName, percentageChange])

        if (!percentageChangesByDate.hasOwnProperty(date)) {
          percentageChangesByDate[date] = {};
        }
        percentageChangesByDate[date][languageName] = percentageChange;
      }
    }

    return percentageChangesByDate;
  }

  async _formatDataForChartNew(languages, scores) {
    let scoresByLanguage = FastestGrowingLanguagesChart._organizeScoresByLanguage(scores);
    console.log(`scoresByLanguage=${JSON.stringify(scoresByLanguage)}`)

    let datesForCalculations = await this._getDatesForCalculations();
    let percentageChangesByDate = await this._getPercentageChangesByDate(scoresByLanguage, datesForCalculations);
    console.log(`percentageChangesByDate=${JSON.stringify(percentageChangesByDate)}`)

    // let percentageChangesByDate = {};

    console.log(languages)

    let formattedScores = [];
    for (let languageName of languages.values()) {
      formattedScores.push(
        {
          title: languageName,
          data: [],
        }
      );
    };

    // Start from 1 because the previous language is just used for calculating the score
    for (let i = 1; i < datesForCalculations.length; i++) {
      let date = datesForCalculations[i].toISOString();
      let sortedKeys = Object.keys(percentageChangesByDate[date]).sort(function (a, b) {
        return (percentageChangesByDate[date][b] - percentageChangesByDate[date][a]);
      });

      console.log(`sortedKeys=${sortedKeys}`)

      let formattedScoresIndex = 0;
      for (let languageName of languages.values()) {
        let yValue = sortedKeys.indexOf(languageName) + 1;
        if (FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChangesByDate[date][languageName]) === null) {
          yValue = null;
        }


        // TODO
        // yValue = FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChangesByDate[date][languageName]);

        formattedScores[formattedScoresIndex].data.push(
          {
            x: i - 1,
            y: yValue,
          }
        );
        formattedScoresIndex ++;
      };
    }

    // console.log(`percentageChangesByDate=${JSON.stringify(percentageChangesByDate)}`)





    // // let scoresByLanguage = this._intermediateFormatScores(scores);
    // // let formattedScores = [];
    // for (let languageName of languages.values()) {
    //   let languageData = [];
    //   // for (let i = 1; i < datesForCalculations.length; i++) {
    //   //   let date = datesForCalculations[i].toISOString();

    //   //   languageData.push(
    //   //     {
    //   //       x: i - 1,
    //   //       y: datesForCalculations[date],
    //   //     }
    //   //   );




    //   // Start from 1 because the previous language is just used for calculating the score
    //   for (let i = 1; i < scoresByLanguage[languageName].length; i++) {
    //     let percentageChange = FastestGrowingLanguagesChart._calculatePercentageChange(
    //       scoresByLanguage[languageName][i - 1],
    //       scoresByLanguage[languageName][i]
    //     );
    //     // percentageChange could be NaN or Infinity
    //     percentageChange = FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChange);

    //     languageData.push(
    //       {
    //         x: i - 1,
    //         y: percentageChange,
    //       }
    //     );
    //   }

    //   formattedScores.push(
    //     {
    //       title: languageName,
    //       data: languageData,
    //     }
    //   );
    // };

    return formattedScores;
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
      // TODO
      // scoresByLanguage[languageName].push(points);
      scoresByLanguage[languageName][date] = points;
    }

    return scoresByLanguage;
  }
  
  static _convertNonFiniteToNull(number) {
    if (!Number.isFinite(number)) {
      number = null;
    }
    return number;
  }

//   _intermediateFormatScoresNew(scores) {
//     console.log(scores)

//     let intermediateScoreData = {};
//     for (let i = 0; i < scores.length; i++) {
//       const date = scores[i].date.toISOString();
//       const languageName = scores[i].language.name;
//       const points = scores[i].points;

//       if (!intermediateScoreData.hasOwnProperty(date)) {
//         intermediateScoreData[date] = [];
//       }
//       intermediateScoreData[languageName].push({
//         languageName: languageName,
//         points: points,
//       });
//     }

//     return intermediateScoreData;
//   }



}

/* 2019-03-26: BUMP CHART
- Old format:
    {
    "title": "Hack",
    "data": [
      {
        "x": 0,
        "y": null
      },
      {
        "x": 1,
        "y": null
      },
      {
        "x": 2,
        "y": 100
      },
      {
        "x": 3,
        "y": 200
      },
      ...
    ]
  },
  {
    "title": "Dart",
    "data": [
      {
        "x": 0,
        "y": null
      },
      {
        "x": 1,
        "y": null
      },
      {
        "x": 2,
        "y": 250
      },
      {
        "x": 3,
        "y": 1480
      },
      ...
    ]
  },
- New format:
    {
    "title": "Hack",
    "data": [
      {
        "x": 0,
        "y": null
      },
      {
        "x": 1,
        "y": null
      },
      {
        "x": 2,
        "y": 10 // ordinal
      },
      {
        "x": 3,
        "y": 9 // ordinal
      },
      ...
    ],
    // Set these in _formatCrosshairItems > value
    "crosshairValues": [
      null,
      null,
      100,
      200,
    ]
  },
  {
    "title": "Dart",
    "data": [
      {
        "x": 0,
        "y": null
      },
      {
        "x": 1,
        "y": null
      },
      {
        "x": 2,
        "y": 8 // ordinal
      },
      {
        "x": 3,
        "y": 7 // ordinal
      },
      ...
    ],
    "crosshairValues": [
      null,
      null,
      250,
      1480,
    ]
  },


*/