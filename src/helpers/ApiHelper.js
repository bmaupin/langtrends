const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;

class ApiHelper {
  static async buildDates(intervalInMonths, numberOfDates = ApiHelper.NUMBER_OF_DATES) {
    let dates = [];
    let currentDate = await ApiHelper._getLatestDateFromApi();
    let earliestDate = await ApiHelper._getEarliestDateFromApi();

    for (let i = 0; i < numberOfDates; i++) {
      if (currentDate <= earliestDate) {
        break;
      }

      dates.push(currentDate);
      currentDate = ApiHelper._subtractMonthsUTC(currentDate, intervalInMonths);
    }

    return dates.reverse();
  }

  static async _getEarliestDateFromApi() {
    const apiFilter = {
      order: 'date ASC',
      limit: 1
    };
    let scoresFromApi = await ApiHelper.callApi(apiFilter);

    return new Date(scoresFromApi[0].date);
  }

  static async _getLatestDateFromApi() {
    const apiFilter = {
      order: 'date DESC',
      limit: 1
    };
    let scoresFromApi = await ApiHelper.callApi(apiFilter);

    return new Date(scoresFromApi[0].date);
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }

  static async callApi(filter) {
    const apiUrl = encodeURI(`${API_BASE_URL}/api/scores?filter=${JSON.stringify(filter)}&access_token=${API_TOKEN}`);
    let response;
    if ('caches' in window.self) {
      const cache = await ApiHelper._getCache();

      response = await cache.match(apiUrl);
      if (typeof response === 'undefined') {
        await cache.add(apiUrl);
        response = await cache.match(apiUrl);
      }
    } else {
      response = await fetch(apiUrl);
    }

    return response.json();
  }

  // TODO: compare current year/month to latest from API
  static async _getCache() {
    const cacheName = ApiHelper._getCurrentYearMonthString();
    // Wipe the old caches every time we create a new one to keep from filling up available cache space
    if (await !caches.has(cacheName)) {
      ApiHelper._deleteAllCaches();
    }
    return await caches.open(cacheName);
  }

  static _getCurrentYearMonthString() {
    return new Date().toISOString().slice(0, 7);
  }

  static async _deleteAllCaches() {
    for (let cacheName of caches.keys()) {
      await caches.delete(cacheName);
    }
  }

  static async getScoresForSeries(languages, dates) {
    const apiFilter = {
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
      // The methods that work with this data will assume that it's ordered by date
      order: 'date ASC',
    };

    return await ApiHelper.callApi(apiFilter);
  }
}

ApiHelper.NUMBER_OF_DATES = 12;
ApiHelper.NUMBER_OF_LANGUAGES = 10;

export default ApiHelper;
