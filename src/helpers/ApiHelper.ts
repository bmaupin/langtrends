const settings = require('../settings.json');

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// TODO: where to put these interfaces?
export interface Language {
  id: number;
  name: string;
  stackoverflowTag?: string;
}

export interface Score {
  date: string;
  language?: Language;
  languageId: number;
  points: number;
}

export default class ApiHelper {
  public static async buildDates(
    intervalInMonths: number,
    numberOfDates = settings.numberOfDates
  ): Promise<string[]> {
    const dates = [];
    let currentDate = await ApiHelper.getLatestDateFromApi();
    const earliestDate = await ApiHelper.getEarliestDateFromApi();

    for (let i = 0; i < numberOfDates; i++) {
      if (currentDate <= earliestDate) {
        break;
      }

      dates.push(currentDate);
      currentDate = ApiHelper.subtractMonthsUTC(currentDate, intervalInMonths);
    }

    dates.reverse();

    // We only need the date as a string; use the same format as the JSON data
    return dates.map((date) => date.toISOString().slice(0, 10));
  }

  private static async getLatestDateFromApi(): Promise<Date> {
    const scores = await ApiHelper.getScoresFromApi();
    // Scores are sorted in ascending order by date
    return new Date(scores[scores.length - 1].date);
  }

  // It might seem ineffecient to call the API every time we need to get the scores,
  // but so far the browser caching seems to handle it just fine. We can always add
  // some kind of caching (e.g. react-query) later if needed.
  private static async getScoresFromApi(dates?: string[]): Promise<Score[]> {
    const apiUrl = encodeURI(`${API_BASE_URL}/scores.json`);

    const response = await fetch(apiUrl);
    const allScores = (await response.json()) as Score[];

    if (dates) {
      return allScores.filter((score) => dates.includes(score.date));
    }

    return allScores;
  }

  private static async getEarliestDateFromApi(): Promise<Date> {
    const scores = await ApiHelper.getScoresFromApi();
    // Scores are sorted in ascending order by date
    return new Date(scores[0].date);
  }

  private static subtractMonthsUTC(date: Date, monthsToSubtract: number): Date {
    // Make a copy of the date object so we don't overwrite it
    const newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }

  public static async getScores(dates: string[]): Promise<Score[]> {
    return await this.getScoresWithLanguages(dates);
  }

  private static async getScoresWithLanguages(
    dates: string[]
  ): Promise<Score[]> {
    const languages = await this.getLanguagesFromApi();
    const scores = await this.getScoresFromApi(dates);
    for (const score of scores) {
      score.language = languages.find(
        (language) => language.id === score.languageId
      );
    }

    return scores;
  }

  private static async getLanguagesFromApi(): Promise<Language[]> {
    const apiUrl = encodeURI(`${API_BASE_URL}/languages.json`);

    const response = await fetch(apiUrl);
    return response.json();
  }
}
