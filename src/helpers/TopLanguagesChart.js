import ApiHelper from './ApiHelper';
import LanguagesChart from './LanguagesChart';

export default class TopLanguagesChart extends LanguagesChart {
  async getSeries(dates) {
    const languages = await this._getLanguages(dates);
    const scoresForSeries = await ApiHelper.getScoresForSeries(languages, dates);
    let formattedSeriesData = this._formatDataForChart(languages, scoresForSeries);

    return formattedSeriesData;
  }

  async _getLanguages(dates) {
    const latestDateFromApi = await ApiHelper.getLatestDateFromApi();

    let filter = {
      where: {
        date: latestDateFromApi.toISOString(),
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

  _formatDataForChart(languages, scores) {
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
}
