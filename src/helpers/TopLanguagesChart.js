import ApiHelper from './ApiHelper';

export default class TopLanguagesChart {
  constructor(interval) {
    this._interval = interval;
  }

  async getDates() {
    if (typeof this._dates === 'undefined') {
      let dates = await ApiHelper.buildDates(this._interval);
      // From this point on we only need the date as a string
      this._dates = dates.map(date => date.toISOString());
    }

    return this._dates;
  }

  async getSeries() {
    const languages = await this._getLanguages();
    const scoresForSeries = await ApiHelper.getScoresForSeries(languages, await this.getDates());
    let formattedSeriesData = await this._formatDataForChart(languages, scoresForSeries);

    return formattedSeriesData;
  }

  // Organize scores by date so we can access each one directly
  static _organizeScoresByDate(scores) {
    let scoresByDate = {};
    for (let i = 0; i < scores.length; i++) {
      const date = scores[i].date;
      const languageName = scores[i].language.name;
      const points = scores[i].points;

      if (!scoresByDate.hasOwnProperty(date)) {
        scoresByDate[date] = {};
      }
      scoresByDate[date][languageName] = points;
    }

    return scoresByDate;
  }

  async _getLanguages() {
    let [lastDate] = (await this.getDates()).slice(-1);

    const filter = {
      where: {
        date: lastDate,
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
      order: 'points DESC',
      limit: ApiHelper.NUMBER_OF_LANGUAGES,
    };
    let topScores = await ApiHelper.callApi(filter);

    // Use a Map because it is guaranteed to maintain order (unlike a plain object)
    let topLanguages = new Map();
    for (let i = 0; i < topScores.length; i++) {
      topLanguages.set(topScores[i].language.id, topScores[i].language.name);
    }

    return topLanguages;
  }

  async _formatDataForChart(languages, scores) {
    let formattedScores = [];

    // TODO: hack
    const dates = await this.getDates();
    // scores = await TopLanguagesChart._getAllScores(dates);
    const scoresByDate = TopLanguagesChart._organizeScoresByDate(scores);

    console.log(dates)
    console.log(scoresByDate)

    console.log(languages)

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

      // let rank = Object.keys(scoresByDate[dates[languageData.data.length]]).indexOf(languageName) + 1;
      let rank = Object.keys(scoresByDate[dates[languageData.data.length]]).sort((a, b) => {return scoresByDate[dates[languageData.data.length]][b] - scoresByDate[dates[languageData.data.length]][a]}).indexOf(languageName) + 1;

      languageData.data.push(
        {
          x: languageData.data.length,
          y: rank,
          hintTitle: languageName,
          // Add the actual score as a separate property so it can be used for hints on mouseover
          hintValue: points,
        }
      );
    }

    return formattedScores;
  }
}
