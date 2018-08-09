const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;
const NUMBER_OF_LANGUAGES = 10;

class ApiHelper {
  static async getScoresForLanguage(languageId, dates) {
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

  // TODO: this feels like a hot mess
  static async getFastestGrowingLanguages(lastDate, interval) {
    const previousDate = ApiHelper._subtractIntervalFromDate(lastDate, interval);
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

      if (scoresByLanguage[langaugeId][previousDate.toISOString()] > 100) {
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

  static buildDates(lastDate, interval) {
    let dates = [];
    let currentDate = lastDate;

    // TODO: magic number?
    for (let i = 0; i < 12; i++) {
      dates.push(currentDate);
      currentDate = ApiHelper._subtractIntervalFromDate(currentDate, interval);
    }

    return dates.reverse();
  }

  static _subtractIntervalFromDate(date, interval) {
    switch (interval) {
      case ApiHelper.INTERVAL_MONTHLY:
        return ApiHelper._subtractOneMonthUTC(date);
      case ApiHelper.INTERVAL_QUARTERLY:
        return ApiHelper._subtractOneQuarterUTC(date);
      case ApiHelper.INTERVAL_YEARLY:
        return ApiHelper._subtractOneYearUTC(date);
      default:
        throw new Error(`Error: interval ${interval} unimplemented`);
    }
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

  static async getTopLanguages() {
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

  static _subtractOneMonthUTC(date) {
    return ApiHelper._subtractMonthsUTC(date, 1);
  }

  static _subtractOneQuarterUTC(date) {
    return ApiHelper._subtractMonthsUTC(date, 3);
  }

  static _subtractOneYearUTC(date) {
    return ApiHelper._subtractMonthsUTC(date, 12);
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }
}

ApiHelper.INTERVAL_MONTHLY = 'monthly';
ApiHelper.INTERVAL_QUARTERLY = 'quarterly';
ApiHelper.INTERVAL_YEARLY = 'yearly';

export default ApiHelper;
