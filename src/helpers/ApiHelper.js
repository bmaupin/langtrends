const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;

class ApiHelper {
  // static async getChartData(chartType, intervalInMonths) {
  //   let chartData = {};
  //   chartData.dates = await ApiHelper._buildDates(intervalInMonths);
  //   chartData.series = await ApiHelper._getSeriesData(chartType, chartData.dates);

  //   // TODO
  //   console.log(`chartData=${JSON.stringify(chartData)}`);

  //   return chartData;
  // }

  // static async _getSeriesData(chartType, dates) {
  //   let chartLanguages = await ApiHelper._getChartLanguages(chartType, dates);

  //   return await ApiHelper._getScoresForChart(chartType, chartLanguages, dates);
  // }

  // static async _getChartLanguages(chartType, dates) {
  //   switch(chartType) {
  //     case ApiHelper.CHART_TYPES.TOP_LANGUAGES:
  //       return await ApiHelper._getTopLanguages();
  //     case ApiHelper.CHART_TYPES.FASTEST_OVER_100:
  //       return await ApiHelper._getFastestGrowingLanguages(dates, 100);
  //     case ApiHelper.CHART_TYPES.FASTEST_OVER_1000:
  //       return await ApiHelper._getFastestGrowingLanguages(dates, 1000);
  //     default:
  //       throw new Error(`Unknown chart type: ${chartType}`);
  //   }
  // }

  // static async _getScoresForChart(chartType, languages, dates) {
  //   let apiFilter = ApiHelper._buildSeriesApiFilter(languages, dates);
  //   let scoresFromApi = await ApiHelper._callApi(apiFilter);
  //   let calculatedSeriesData = ApiHelper._calculateDataForChart(chartType, scoresFromApi);
  //   let formattedSeriesData = ApiHelper._formatDataForChart(languages, calculatedSeriesData);

  //   return formattedSeriesData;
  // }

  // TODO: Move this to ChartData if that's the only place it's used
  static _buildSeriesApiFilter(languages, dates) {
    return {
      where: {
        and: [
          {
            or: Array.from(languages.keys()).map(languageId => ({languageId: languageId}))
          },
          {
            or: dates.map(date => ({date: date.toISOString()}))
          }
        ]
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
      order: 'date ASC',
    };
  }

  // static _calculateDataForChart(chartType, scores) {
  //   // intermediate format: calculatedData = {'languagename': [score, score], 'languagename': [score, score]}

  //   let calculatedData = {};

  //   for (let i = 0; i < scores.length; i++) {
  //     const languageName = scores[i].language.name;
  //     const points = scores[i].points;

  //     if (!calculatedData.hasOwnProperty(languageName)) {
  //       calculatedData[languageName] = [];
  //     }
  //     calculatedData[languageName].push(points);
  //   }

  //   return calculatedData;
  // }

  // static _formatDataForChart(languages, calculatedSeriesData) {
  //   let formattedScores = [];

  //   languages.forEach(languageName => {
  //     let languageData = [];

  //     for (let i = 0; i < calculatedSeriesData[languageName].length; i++) {
  //       languageData.push(
  //         {
  //           x: i,
  //           y: calculatedSeriesData[languageName][i],
  //         }
  //       );
  //     }

  //     formattedScores.push(
  //       {
  //         title: languageName,
  //         data: languageData,
  //       }
  //     );
  //   });

  //   // for (let i = 0; i < scores.length; i++) {
  //   //   const languageName = scores[i].language.name;
  //   //   const points = scores[i].points;

  //   //   let languageData = formattedScores.find(languageData => languageData.title === languageName);

  //   //   languageData.data.push(
  //   //     {
  //   //       x: languageData.data.length,
  //   //       y: points,
  //   //     }
  //   //   )
  //   // }

  //   return formattedScores;
  // }

  // TODO: this is a hot mess
  static async _getFastestGrowingLanguages(dates, minimumScore) {
    let [previousDate, lastDate] = dates.slice(dates.length - 2, dates.length);
    let scores = await ApiHelper._getScoresForDates([lastDate, previousDate]);
    let scoresByLanguage = {};
    let languageNames = {};

    console.log(`SCORES=${JSON.stringify(scores)}`);
    // [{"date":"2018-05-01T00:00:00.000Z","points":112583,"id":19896,"languageId":8,"language":{"name":"Haskell","stackoverflowTag":null,"id":8}},{"date": ...},

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

    console.log(scoresByLanguage);
    // {1: {2018-05-01T00:00:00.000Z: 33054, 2018-08-01T00:00:00.000Z: 33178}, 2: ...}

    let scoreDifferences = {};

    for (let langaugeId in scoresByLanguage) {
      // TODO: have separate UI options for the different algorithms
      // scoreDifferences[langaugeId] = scoresByLanguage[langaugeId][lastDate.toISOString()] - scoresByLanguage[langaugeId][previousDate.toISOString()];

      if (scoresByLanguage[langaugeId][previousDate.toISOString()] > minimumScore) {
        scoreDifferences[langaugeId] = scoresByLanguage[langaugeId][lastDate.toISOString()] / scoresByLanguage[langaugeId][previousDate.toISOString()] * 100;
      }
    }

    console.log(scoreDifferences);
    // 1:124, 2:54451

    let sortedScores = Object.keys(scoreDifferences).sort(function(a,b) {return scoreDifferences[b] - scoreDifferences[a];});
    let fastestGrowingLanguages = new Map();

    for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
      fastestGrowingLanguages.set(sortedScores[i], languageNames[sortedScores[i]]);
    }

    console.log(sortedScores);
    // 0:"10", 1:"9", 2:"15"

    console.log(fastestGrowingLanguages);
    // 0:{"10" => "JavaScript"}, 1:{"9" => "Java"}, 2:{"15" => "Python"}

    // chartData=[{"title":"JavaScript","data":[{"x":0,"y":2466983},...,{"title":"Java","data":[{"x":0,"y":2199100},

    return fastestGrowingLanguages;
  }

  static async _getScoresForDates(dates) {
    let apiFilter = {
      where: {
        or: dates.map(date => ({date: date.toISOString()}))
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
      // TODO
      // Have the API sort the data for us so we don't have to
      // order: 'date DESC',
    };

    return await ApiHelper._callApi(apiFilter);
  }

  static async _callApi(filter) {
    let apiUrl = encodeURI(`${API_BASE_URL}/api/scores?filter=${JSON.stringify(filter)}&access_token=${API_TOKEN}`);

    console.log(apiUrl)

    let response = await fetch(apiUrl);
    return response.json();
  }

  static async _getTopLanguages() {
    let topLanguages = new Map();
    const latestDateFromApi = await ApiHelper._getLatestDateFromApi();

    let filter = {
      where: {
        date: latestDateFromApi.toISOString(),
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
      order: 'points DESC',
      limit: ApiHelper.NUMBER_OF_LANGUAGES,
    };
    let topScores = await ApiHelper._callApi(filter);

    for (let i = 0; i < topScores.length; i++) {
      topLanguages.set(topScores[i].language.id, topScores[i].language.name);
    }

    return topLanguages;
  }

  static async _getLatestDateFromApi() {
    let filter = {
      order: 'date DESC',
      limit: 1
    };
    let scoresFromApi = await ApiHelper._callApi(filter);

    return new Date(scoresFromApi[0].date);
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }
}

// ApiHelper.CHART_TYPES = {
//   TOP_LANGUAGES: 'toplanguages',
//   FASTEST_OVER_100: 'fastestover100',
//   FASTEST_OVER_1000: 'fastestover1000',
// };
ApiHelper.NUMBER_OF_LANGUAGES = 10;

export default ApiHelper;
