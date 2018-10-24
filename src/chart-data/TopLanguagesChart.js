import ApiHelper from '../helpers/ApiHelper';
import LanguagesChart from './LanguagesChart';

export default class TopLanguagesChart extends LanguagesChart {
  async getLanguages(dates) {
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

    let topLanguages = new Map();
    for (let i = 0; i < topScores.length; i++) {
      topLanguages.set(topScores[i].language.id, topScores[i].language.name);
    }

    console.log(`topLanguages=${JSON.stringify([...topLanguages])}`)

    return topLanguages;
  }

  formatDataForChart(languages, scores) {
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
