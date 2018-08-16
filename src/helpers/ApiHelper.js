const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;
const NUMBER_OF_DATES = 12;
const NUMBER_OF_LANGUAGES = 10;

class ApiHelper {
  static async getChartData(chartType, intervalInMonths) {
    let chartData = {};
    chartData.dates = await ApiHelper._buildDates(intervalInMonths);
    chartData.series = await ApiHelper._getSeriesData(chartType, chartData.dates);

    // TODO
    console.log(`chartData=${JSON.stringify(chartData)}`);

    return chartData;
  }

  static async _getSeriesData(chartType, dates) {
    let chartLanguages = await ApiHelper._getChartLanguages(chartType, dates);

    return await ApiHelper._getScoresForChart(chartLanguages, dates);
  }

  static async _getChartLanguages(chartType, dates) {
    switch(chartType) {
      case ApiHelper.CHART_TYPES.TOP_LANGUAGES:
        return await ApiHelper._getTopLanguages();
      case ApiHelper.CHART_TYPES.FASTEST_OVER_100:
        return await ApiHelper._getFastestGrowingLanguages(dates, 100);
      case ApiHelper.CHART_TYPES.FASTEST_OVER_1000:
        return await ApiHelper._getFastestGrowingLanguages(dates, 1000);
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }
  }

  static async _getScoresForChart(languages, dates) {
    let apiFilter = ApiHelper._buildSeriesApiFilter(languages, dates);
    let scoresFromApi = await ApiHelper._callApi(apiFilter);
    let formattedScores = ApiHelper._formatScoresForChart(languages, scoresFromApi);

    return formattedScores;
  }

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

  static _formatScoresForChart(languages, scores) {
    let formattedScores = [];

    languages.forEach(languageName => {
      formattedScores.push(
        {
          title: languageName,
          data: [],
        }
      );
    });

    for (let i = 0; i < scores.length; i++) {
      const languageName = scores[i].language.name;
      const points = scores[i].points;

      let languageData = formattedScores.find(languageData => languageData.title === languageName);

      languageData.data.push(
        {
          x: languageData.data.length,
          y: points,
        }
      )
    }

    return formattedScores;
  }

  // TODO: this is a hot mess
  static async _getFastestGrowingLanguages(dates, minimumScore) {
    let [previousDate, lastDate] = dates.slice(dates.length - 2, dates.length);
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

      if (scoresByLanguage[langaugeId][previousDate.toISOString()] > minimumScore) {
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
