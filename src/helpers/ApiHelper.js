const settings = require('../settings.json');

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;

class ApiHelper {
  static async buildDates(
    intervalInMonths,
    numberOfDates = settings.numberOfDates
  ) {
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
      limit: 1,
    };
    let scoresFromApi = await ApiHelper._callApi(apiFilter);

    return new Date(scoresFromApi[0].date);
  }

  static async _getLatestDateFromApi(bypassCache) {
    const apiFilter = {
      order: 'date DESC',
      limit: 1,
    };
    let scoresFromApi = await ApiHelper._callApi(apiFilter, bypassCache);

    return new Date(scoresFromApi[0].date);
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }

  static async _callApi(filter, bypassCache) {
    const apiUrl = encodeURI(
      `${API_BASE_URL}/api/scores?filter=${JSON.stringify(
        filter
      )}&access_token=${API_TOKEN}`
    );
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
    // If there's a cache matching the current year/month, return it in order to avoid calling the API
    const currentYearMonthString = ApiHelper._getCurrentYearMonthString();
    if (await caches.has(currentYearMonthString)) {
      return await caches.open(currentYearMonthString);
    }

    // If the latest year/month in the API is current, delete all the old caches before returning the new one
    const latestYearMonthString = await ApiHelper._getLatestYearMonthStringFromApi();
    if (latestYearMonthString === currentYearMonthString) {
      await ApiHelper._deleteAllCaches();
    }

    // Return a cache for the latest year/month in the API (whether the current month or a previous one)
    return await caches.open(latestYearMonthString);
  }

  static _getCurrentYearMonthString() {
    return new Date().toISOString().slice(0, 7);
  }

  static async _getLatestYearMonthStringFromApi() {
    return (await ApiHelper._getLatestDateFromApi(true))
      .toISOString()
      .slice(0, 7);
  }

  static async _deleteAllCaches() {
    for (let cacheName of await caches.keys()) {
      await caches.delete(cacheName);
    }
  }

  static async getAllScores(dates) {
    const apiFilter = ApiHelper._buildApiFilter(dates);
    return await ApiHelper._callApi(apiFilter);
  }

  static _buildApiFilter(dates) {
    return {
      where: {
        or: dates.map(date => ({ date: date })),
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
    };
  }

  static async areScoresCached(dates) {
    const apiFilter = ApiHelper._buildApiFilter(dates);
    const apiUrl = encodeURI(
      `${API_BASE_URL}/api/scores?filter=${JSON.stringify(
        apiFilter
      )}&access_token=${API_TOKEN}`
    );
    const currentYearMonthString = ApiHelper._getCurrentYearMonthString();

    if (await caches.has(currentYearMonthString)) {
      const cache = await caches.open(currentYearMonthString);
      // cache.match will return undefined if the URL isn't cached
      return typeof (await cache.match(apiUrl)) !== 'undefined';
    } else {
      return false;
    }
  }
}

export default ApiHelper;
