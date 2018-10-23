import ApiHelper from '../helpers/ApiHelper';
import LanguagesChart from './LanguagesChart';

export default class TopLanguagesChart extends LanguagesChart {
  async getLanguages() {
    let topLanguages = new Map();
    const latestDateFromApi = await ApiHelper._getLatestDateFromApi();

    let filter = {
      where: {
        date: latestDateFromApi.toISOString(),
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
      order: 'points DESC',
      limit: ApiHelper.NUMBER_OF_LANGUAGES,
    };
    let topScores = await ApiHelper._callApi(filter);

    for (let i = 0; i < topScores.length; i++) {
      topLanguages.set(topScores[i].language.id, topScores[i].language.name);
    }

    return topLanguages;
  }

  async getSeries(chartType, dates) {
    return await ApiHelper._getSeriesData(chartType, dates);
  }

  getScores() {}
}
