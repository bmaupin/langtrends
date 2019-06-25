const settings = require('../settings.json');

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;

class ApiHelper {
  static async buildDates(intervalInMonths, numberOfDates = settings.numberOfDates) {
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

  static async _getLatestDateFromApi(bypassCache) {
    const apiFilter = {
      order: 'date DESC',
      limit: 1
    };
    let scoresFromApi = await ApiHelper.callApi(apiFilter, bypassCache);

    return new Date(scoresFromApi[0].date);
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }

  static async callApi(filter, bypassCache) {
    const apiUrl = encodeURI(`${API_BASE_URL}/api/scores?filter=${JSON.stringify(filter)}&access_token=${API_TOKEN}`);
    let response;

    if (bypassCache || !('caches' in window.self)) {
      response = await fetch(apiUrl);
    } else {
      const cache = await ApiHelper._getCache();
      response = await cache.match(apiUrl);
      if (typeof response === 'undefined') {
        await cache.add(apiUrl);
        response = await cache.match(apiUrl);
      }
    }

    return response.json();
  }

  static async _getCache() {
    // If there's a cache matching the current year/month, return it
    const currentYearMonthString = ApiHelper._getCurrentYearMonthString();
    if (await caches.has(currentYearMonthString)) {
      return await caches.open(currentYearMonthString);
    }

    // If the latest year/month in the API is current and the API is finished syncing,
    // delete all old caches and return a new one for the current year/month
    const latestYearMonthString = await ApiHelper._getLatestYearMonthStringFromApi();
    if (latestYearMonthString === currentYearMonthString && ApiHelper._isApiFinishedSyncing(currentYearMonthString)) {
      await ApiHelper._deleteAllCaches();
      return await caches.open(currentYearMonthString);
    }

    // If we end up here, return a cache for the latest year/month in the API
    return await caches.open(latestYearMonthString);
  }

  static async _isApiFinishedSyncing(yearMonthString) {
    return await ApiHelper._getNumberOfLanguagesFromApi(yearMonthString) === await ApiHelper._getTotalNumberOfLanguages();
  }

  static async _getNumberOfLanguagesFromApi(yearMonthString) {
    const where = {
      date: yearMonthString
    };
    const apiUrl = encodeURI(`${API_BASE_URL}/api/scores/count?where=${JSON.stringify(where)}&access_token=${API_TOKEN}`);
    const response = await fetch(apiUrl);

    return (await response.json()).count;
  }

  static async _getTotalNumberOfLanguages() {
    const response = await fetch('https://raw.githubusercontent.com/bmaupin/langtrends-api/master/server/boot/classes/languages.json');
    const languages = await response.json();

    return Object.keys(languages).reduce((numberOfIncludedLanguages, languageName) => {
      if (languages[languageName].include === true) {
        numberOfIncludedLanguages += 1;
      }
      return numberOfIncludedLanguages;
    }, 0);
  }

  static _getCurrentYearMonthString() {
    return new Date().toISOString().slice(0, 7);
  }

  static async _getLatestYearMonthStringFromApi() {
    return (await ApiHelper._getLatestDateFromApi(true)).toISOString().slice(0, 7);
  }

  static async _deleteAllCaches() {
    for (let cacheName of await caches.keys()) {
      await caches.delete(cacheName);
    }
  }

  static async getAllScores(dates) {
    const apiFilter = {
      where: {
        or: dates.map(date => ({ date: date }))
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
    };

    return await ApiHelper.callApi(apiFilter);
  }
}

export default ApiHelper;
