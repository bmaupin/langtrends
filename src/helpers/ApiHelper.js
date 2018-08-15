const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;
const NUMBER_OF_DATES = 12;
const NUMBER_OF_LANGUAGES = 10;

class ApiHelper {
  static async getChartData(chartType, intervalInMonths) {
    let chartData = {};
    chartData.dates = await ApiHelper._buildDates(intervalInMonths);
    chartData.series = await ApiHelper._getSeriesData(chartType, chartData.dates);

    return chartData;
  }

  static async _getSeriesData(chartType, dates) {
    let chartLanguages = await ApiHelper._getChartLanguages(chartType, dates);

    let chartData = [];
    for (let [languageId, languageName] of chartLanguages) {
      chartData.push(
        {
          title: languageName,
          data: await ApiHelper._getScoresForLanguage(languageId, dates),
        }
      );
    }

    return chartData;
  }

  static async _getChartLanguages(chartType, dates) {
    switch(chartType) {
      case ApiHelper.CHART_TYPES.TOP_LANGUAGES:
        return await ApiHelper._getTopLanguages();
      case ApiHelper.CHART_TYPES.FASTEST_OVER_100:
        throw new Error(`Unimplemented chart type: ${chartType}`);
      case ApiHelper.CHART_TYPES.FASTEST_OVER_1000:
        throw new Error(`Unimplemented chart type: ${chartType}`);
      default:
        throw new Error(`Unhandled chart type: ${chartType}`);
    }
  }

  static async _getScoresForLanguage(languageId, dates) {
    let scores = [];
    let scoresApiFilter = ApiHelper._buildScoresApiFilter(languageId, dates);
    let scoresFromApi = await ApiHelper._callApi(scoresApiFilter);

    // Sort by date, oldest first (the dates probably won't be in order)
    scoresFromApi.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    console.log(`dates=${JSON.stringify(dates)}`);
    console.log(`scoresFromApi=${JSON.stringify(scoresFromApi)}`);

    for (let i = 0; i < scoresFromApi.length; i++) {
      scores.push(
        {
          // The x axis values must be numbers
          x: scores.length,
          y: scoresFromApi[i].points
        }
      );
    }

    return scores;
  }

  // TODO: this is a hot mess
  static async getFastestGrowingLanguages(intervalInMonths) {
    const lastDate = await ApiHelper._getLatestDateFromApi();
    const previousDate = ApiHelper._subtractMonthsUTC(lastDate, intervalInMonths);
    let scores = await ApiHelper._getScoresForDates([lastDate, previousDate]);
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
      // TODO: have separate UI options for the different algorithms
      // scoreDifferences[langaugeId] = scoresByLanguage[langaugeId][lastDate.toISOString()] - scoresByLanguage[langaugeId][previousDate.toISOString()];

      if (scoresByLanguage[langaugeId][previousDate.toISOString()] > 1000) {
        scoreDifferences[langaugeId] = scoresByLanguage[langaugeId][lastDate.toISOString()] / scoresByLanguage[langaugeId][previousDate.toISOString()] * 100;
      }
    }

    let sortedScores = Object.keys(scoreDifferences).sort(function(a,b) {return scoreDifferences[b] - scoreDifferences[a];});
    let fastestGrowingLanguages = new Map();

    for (let i = 0; i < NUMBER_OF_LANGUAGES; i++) {
      fastestGrowingLanguages.set(sortedScores[i], languageNames[sortedScores[i]]);
    }

    return fastestGrowingLanguages;
  }

  static async _getScoresForDates(dates) {
    let apiFilter = {
      where: {
        or: dates.map(date => ({date: date.toISOString()}))
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
    };

    return await ApiHelper._callApi(apiFilter);
  }

  static async _buildDates(intervalInMonths) {
    let dates = [];
    let currentDate = await ApiHelper._getLatestDateFromApi();

    for (let i = 0; i < NUMBER_OF_DATES; i++) {
      dates.push(currentDate);
      currentDate = ApiHelper._subtractMonthsUTC(currentDate, intervalInMonths);
    }

    return dates.reverse();
  }

  static _buildScoresApiFilter(languageId, dates) {
    return {
      where: {
        and: [
          {languageId: languageId},
          {
            or: dates.map(date => ({date: date.toISOString()}))
          }
        ]
      }
    };
  }

  static async _callApi(filter) {
    let apiUrl = encodeURI(`${API_BASE_URL}/api/scores?filter=${JSON.stringify(filter)}&access_token=${API_TOKEN}`);

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
      limit: NUMBER_OF_LANGUAGES,
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

ApiHelper.CHART_TYPES = {
  TOP_LANGUAGES: 'toplanguages',
  FASTEST_OVER_100: 'fastestover100',
  FASTEST_OVER_1000: 'fastestover1000',
};

export default ApiHelper;
