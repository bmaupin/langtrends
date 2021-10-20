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

  static async _getLatestDateFromApi() {
    const apiFilter = {
      order: 'date DESC',
      limit: 1,
    };
    let scoresFromApi = await ApiHelper._callApi(apiFilter);

    return new Date(scoresFromApi[0].date);
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }

  static async _callApi(filter) {
    const apiUrl = encodeURI(
      `${API_BASE_URL}/api/scores?filter=${JSON.stringify(
        filter
      )}&access_token=${API_TOKEN}`
    );

    const response = await fetch(apiUrl);
    return response.json();
  }

  static async getAllScores(dates) {
    const apiFilter = ApiHelper._buildApiFilter(dates);
    return await ApiHelper._callApi(apiFilter);
  }

  static _buildApiFilter(dates) {
    return {
      where: {
        or: dates.map((date) => ({ date: date })),
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
    };
  }
}

export default ApiHelper;
