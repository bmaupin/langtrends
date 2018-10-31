const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;

class ApiHelper {
  static async buildDates(intervalInMonths, numberOfDates = ApiHelper.NUMBER_OF_DATES) {
    let dates = [];
    let currentDate = await ApiHelper.getLatestDateFromApi();

    for (let i = 0; i < numberOfDates; i++) {
      dates.push(currentDate);
      currentDate = ApiHelper._subtractMonthsUTC(currentDate, intervalInMonths);
    }

    return dates.reverse();
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }

  static async callApi(filter) {
    let apiUrl = encodeURI(`${API_BASE_URL}/api/scores?filter=${JSON.stringify(filter)}&access_token=${API_TOKEN}`);

    let response = await fetch(apiUrl);
    return response.json();
  }

  static async getLatestDateFromApi() {
    const apiFilter = {
      order: 'date DESC',
      limit: 1
    };
    let scoresFromApi = await ApiHelper.callApi(apiFilter);

    return new Date(scoresFromApi[0].date);
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
