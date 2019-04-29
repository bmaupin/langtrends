import ApiHelper from './ApiHelper';

export default class FastestGrowingLanguagesChart {
  constructor(interval, minimumScore) {
    this._interval = interval;
    this._minimumScore = minimumScore;
  }

  async getDates() {
    // We need one extra date internally for calculations, so to avoid extra API calls just drop the extra date
    return (await this._getDatesForCalculations()).slice(1);
  }

  async _getDatesForCalculations() {
    if (typeof this._dates === 'undefined') {
      this._dates = await ApiHelper.buildDates(this._interval, ApiHelper.NUMBER_OF_DATES + 1);
    }
    return this._dates;
  }

  async getSeries() {
    const languages = await this._getLanguages();
    const scoresForSeries = await ApiHelper.getScoresForSeries(languages, await this._getDatesForCalculations());
    let formattedSeriesData = await this._convertAndFormatScores(languages, scoresForSeries);

    // TODO
    return await this.getSeriesNew()

    // return formattedSeriesData;
  }

  async getSeriesNew() {
    const datesForCalculations = await this._getDatesForCalculations();

    // First, get all the scores for every date
    const scoresFromApi = await FastestGrowingLanguagesChart._getAllScores(datesForCalculations);
    console.log('allScores')
    console.log(scoresFromApi)

    // Next, reformat the data from the API so we can look it up
    // - by date, then by language
    // allScores[date][languageName] = points

    const scoresByDate = FastestGrowingLanguagesChart._organizeScoresByDate(scoresFromApi);

    /*
      Calculate percentage change
        For each date
          Go through each score
            Get the previous score **for that language**
            Calculate the percentage difference
            Store it somewhere??
    */

    const percentageChangesByDate = FastestGrowingLanguagesChart._getPercentageChangesByDateNew(scoresByDate, datesForCalculations);
    console.log('percentageChangesByDate')
    console.log(percentageChangesByDate)

    /*
      Calcultate fastest growing languages
        For each date
          Get the top n fastest growing languages
          Store the language, percentage difference **by date**
            percentageDifferences[date][language] = percentageDifference
          Add the language name to an overall list of???
    */

    const topPercentageChanges = await this._calculateTopPercentageChanges(percentageChangesByDate);

    /*
      Compile data
        For each date
          Sort the percentage Differences and/or calculate ranks
          For each language in the fastest growing languages **for that date**
            Add to chartData
              Set y = rank
              Set hover value = percentageDifference
          For each language in the overall list of fastest growing languages but not for that date
            Add to chartData
              Set y = null
    */

    const formattedSeriesData = await this._formatDataForChartNew(topPercentageChanges);

    console.log('formattedSeriesData')
    console.log(formattedSeriesData)

    return formattedSeriesData

    /*
      Reformat data?
    */

    




    // ?????Next, for each date, calculate the fastest growing languages for just that date



    // Format from API:
    // - an array where every entry has the date, language, score

    // Final format:
    //   - chart data is an array with one entry for every single language
    //   - each language will have an array with one entry for every single x value
    //   - the y value should only be filled *if* that language is one of the top n languages for that date...
  }

  // Organize scores by date so we can access each one directly
  static _organizeScoresByDate(scores) {
    let scoresByDate = {};
    for (let i = 0; i < scores.length; i++) {
      // This date comes directly from the API as a string, so no need to call .toISOString() on it
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

  static _getPercentageChangesByDateNew(scoresByDate, datesForCalculations) {
    let percentageChangesByDate = {};

    // Start from 1 because the previous date is just used for calculating the percentage change
    for (let i = 1; i < datesForCalculations.length; i++) {
      let date = datesForCalculations[i].toISOString();
      let previousDate = datesForCalculations[i - 1].toISOString();
      percentageChangesByDate[date] = {};

      for (let languageName in scoresByDate[date]) {
        let percentageChange = FastestGrowingLanguagesChart._calculatePercentageChange(
          scoresByDate[previousDate][languageName],
          scoresByDate[date][languageName]
        );

        // percentageChange could be NaN or Infinity, but react-vis can only handle numbers or null
        percentageChange = FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChange);

        percentageChangesByDate[date][languageName] = percentageChange;
      }
    }

    return percentageChangesByDate;
  }



  /*
    For every date
      Calculate the top n percentageChanges

  */

  // const test = {
  //   "2016-07-01T00:00:00.000Z": {
  //     "Haskell":106.59480660768989,
  //     "Clojure":106.34576098059244,
  //     "ActionScript":102.34683281412254,
  //     "CoffeeScript":104.34127322171621,
  //   },
  //   "2016-10-01T00:00:00.000Z": {
  //     "Pony":125.71428571428571,
  //     "Pike":106.74157303370787,
  //     "Pascal":110.82523018673092,
  //     "PureBasic":106.5052950075643,
  //   }
  // }


  async _calculateTopPercentageChanges(percentageChangesByDate) {
    const datesForChart = await this.getDates();
    let topPercentageChanges = {};

    for (let i = 0; i < datesForChart.length; i++) {
      let date = datesForChart[i].toISOString();
      // TODO: make this a map to guarantee order
      topPercentageChanges[date] = {};

      // Sort percentage changes so we can get the top N and do an ordinal ranking for a bump chart
      let sortedKeys = Object.keys(percentageChangesByDate[date]).sort(function (a, b) {
        return (percentageChangesByDate[date][b] - percentageChangesByDate[date][a]);
      });

      // for (let languageName of sortedKeys) {
      for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
        let languageName = sortedKeys[i];
        topPercentageChanges[date][languageName] = percentageChangesByDate[date][languageName];
      }
    }

    return topPercentageChanges;
  }

  async _formatDataForChartNew(topPercentageChanges) {
    let formattedScores = [];
    const allFastestGrowingLanguages = FastestGrowingLanguagesChart._getAllFastestGrowingLanguages(topPercentageChanges);

    for (let languageName of allFastestGrowingLanguages) {
      formattedScores.push(
        {
          title: languageName,
          data: [],
        }
      );
    }

    let datesForChart = await this.getDates();
    for (let i = 0; i < datesForChart.length; i++) {
      let date = datesForChart[i].toISOString();

      let formattedScoresIndex = 0;
      for (let languageName of allFastestGrowingLanguages) {
        let percentageChange = null;
        let rank = null;
        if (topPercentageChanges[date].hasOwnProperty(languageName)) {
          percentageChange = topPercentageChanges[date][languageName];
          // TODO: this should be a map to guarantee order
          rank = Object.keys(topPercentageChanges[date]).indexOf(languageName) + 1;
        }

        formattedScores[formattedScoresIndex].data.push(
          {
            x: i,
            // Use the ordinal number ranking for the chart data in order to create a bump chart
            y: rank,
            // TODO: don't add hintTitle and hintValue if rank/percentageChange is null
            hintTitle: languageName,
            // Add the actual percentage change as a separate property so it can be used for hints on mouseover
            hintValue: `${Math.round(percentageChange)}% growth`,
          }
        );
        formattedScoresIndex ++;
      }
    }

    return formattedScores;
  }

  static _getAllFastestGrowingLanguages(topPercentageChanges) {
    let allFastestGrowingLanguages = [];

    for (let date in topPercentageChanges) {
      for (let languageName in topPercentageChanges[date]) {
        if (!allFastestGrowingLanguages.includes(languageName)) {
          allFastestGrowingLanguages.push(languageName);
        }
      }
    }

    return allFastestGrowingLanguages;
  }



  async _getLanguages() {
    let [nextToLastDate, lastDate] = (await this._getDatesForCalculations()).slice(-2);
    let scoresForLastTwoDates = await FastestGrowingLanguagesChart._getAllScores([lastDate, nextToLastDate]);
    console.log('scoresForLastTwoDates')
    console.log(scoresForLastTwoDates)
    

    let scoresByLanguage = {};
    let languageNamesById = {};
    for (let i = 0; i < scoresForLastTwoDates.length; i++) {
      const date = scoresForLastTwoDates[i].date;
      const languageId = scoresForLastTwoDates[i].languageId;
      const languageName = scoresForLastTwoDates[i].language.name;
      const points = scoresForLastTwoDates[i].points;

      if (!scoresByLanguage.hasOwnProperty(languageId)) {
        scoresByLanguage[languageId] = {};
        languageNamesById[languageId] = languageName;
      }

      scoresByLanguage[languageId][date] = points;
    }

    let scorePercentageChanges = {};
    for (let langaugeId in scoresByLanguage) {
      if (scoresByLanguage[langaugeId][lastDate.toISOString()] > this._minimumScore) {
        scorePercentageChanges[langaugeId] = FastestGrowingLanguagesChart._calculatePercentageChange(
          scoresByLanguage[langaugeId][nextToLastDate.toISOString()],
          scoresByLanguage[langaugeId][lastDate.toISOString()]
        );
      }
    }

    let fastestGrowingLanguageIds = Object.keys(scorePercentageChanges).sort((a, b) => {
      return scorePercentageChanges[b] - scorePercentageChanges[a];
    });

    // Use a Map because it is guaranteed to maintain order (unlike a plain object)
    let fastestGrowingLanguages = new Map();
    for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
      fastestGrowingLanguages.set(fastestGrowingLanguageIds[i], languageNamesById[fastestGrowingLanguageIds[i]]);
    }

    return fastestGrowingLanguages;
  }

  static async _getAllScores(dates) {
    const apiFilter = {
      where: {
        or: dates.map(date => ({ date: date.toISOString() }))
      },
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
    };

    return await ApiHelper.callApi(apiFilter);
  }

  static _calculatePercentageChange(oldValue, newValue) {
    return newValue / oldValue * 100;
  }

  // Convert the data from raw scores into percentage changes and format for the chart
  async _convertAndFormatScores(languages, scores) {
    let scoresByLanguage = FastestGrowingLanguagesChart._organizeScoresByLanguage(scores);
    let datesForCalculations = await this._getDatesForCalculations();
    let percentageChangesByDate = this._getPercentageChangesByDate(scoresByLanguage, datesForCalculations);

    return await this._formatDataForChart(languages, percentageChangesByDate);
  }

  // Organize scores by language so we can access each one directly
  static _organizeScoresByLanguage(scores) {
    let scoresByLanguage = {};
    for (let i = 0; i < scores.length; i++) {
      const date = scores[i].date;
      const languageName = scores[i].language.name;
      const points = scores[i].points;

      if (!scoresByLanguage.hasOwnProperty(languageName)) {
        scoresByLanguage[languageName] = {};
      }
      scoresByLanguage[languageName][date] = points;
    }

    return scoresByLanguage;
  }

  _getPercentageChangesByDate(scoresByLanguage, datesForCalculations) {
    let percentageChangesByDate = {};
    for (let languageName in scoresByLanguage) {
      // Start from 1 because the previous date is just used for calculating the percentage change
      for (let i = 1; i < datesForCalculations.length; i++) {
        let date = datesForCalculations[i].toISOString();
        let previousDate = datesForCalculations[i - 1].toISOString();

        let percentageChange = FastestGrowingLanguagesChart._calculatePercentageChange(
          scoresByLanguage[languageName][previousDate],
          scoresByLanguage[languageName][date]
        );

        // percentageChange could be NaN or Infinity, but react-vis can only handle numbers or null
        percentageChange = FastestGrowingLanguagesChart._convertNonFiniteToNull(percentageChange);

        if (!percentageChangesByDate.hasOwnProperty(date)) {
          percentageChangesByDate[date] = {};
        }
        percentageChangesByDate[date][languageName] = percentageChange;
      }
    }

    return percentageChangesByDate;
  }

  static _convertNonFiniteToNull(number) {
    if (!Number.isFinite(number)) {
      number = null;
    }
    return number;
  }

  async _formatDataForChart(languages, percentageChangesByDate) {
    let formattedScores = [];
    for (let languageName of languages.values()) {
      formattedScores.push(
        {
          title: languageName,
          data: [],
        }
      );
    }

    let datesForChart = await this.getDates();
    for (let i = 0; i < datesForChart.length; i++) {
      let date = datesForChart[i].toISOString();
      // Sort percentage changes so we can do an ordinal ranking for a bump chart
      let sortedKeys = Object.keys(percentageChangesByDate[date]).sort(function (a, b) {
        return (percentageChangesByDate[date][b] - percentageChangesByDate[date][a]);
      });

      let formattedScoresIndex = 0;
      for (let languageName of languages.values()) {
        let percentageChange = percentageChangesByDate[date][languageName];
        let rank = sortedKeys.indexOf(languageName) + 1;
        if (percentageChange === null) {
          rank = null;
        }

        formattedScores[formattedScoresIndex].data.push(
          {
            x: i,
            // Use the ordinal number ranking for the chart data in order to create a bump chart
            y: rank,
            hintTitle: languageName,
            // Add the actual percentage change as a separate property so it can be used for hints on mouseover
            hintValue: `${Math.round(percentageChange)}% growth`,
          }
        );
        formattedScoresIndex ++;
      }
    }

    return formattedScores;
  }
}
