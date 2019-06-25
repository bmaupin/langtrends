import ApiHelper from './ApiHelper';

export default class LanguagesChart {
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

  static async _calculateTopScores(scoresByDate, dates) {
    let topScores = {};

    for (let i = 0; i < dates.length; i++) {
      let date = dates[i];
      // TODO: make this a map to guarantee order
      topScores[date] = {};

      // Sort scores so we can get the top N and do an ordinal ranking for a bump chart
      let sortedKeys = Object.keys(scoresByDate[date]).sort(function (a, b) {
        return (scoresByDate[date][b] - scoresByDate[date][a]);
      });

      for (let i = 0; i < ApiHelper.NUMBER_OF_LANGUAGES; i++) {
        let languageName = sortedKeys[i];
        topScores[date][languageName] = scoresByDate[date][languageName];
      }
    }

    return topScores;
  }

  async _formatDataForChart(topScores, dates) {
    let formattedScores = [];
    const allTopLanguages = LanguagesChart._getAllTopLanguages(topScores);

    for (let languageName of allTopLanguages) {
      formattedScores.push(
        {
          title: languageName,
          data: [],
        }
      );
    }

    for (let i = 0; i < dates.length; i++) {
      let date = dates[i];

      let formattedScoresIndex = 0;
      for (let languageName of allTopLanguages) {
        let score = null;
        let rank = null;
        if (topScores[date].hasOwnProperty(languageName)) {
          score = topScores[date][languageName];
          // TODO: this should be a map to guarantee order
          rank = Object.keys(topScores[date]).indexOf(languageName) + 1;
        }

        formattedScores[formattedScoresIndex].data.push(
          {
            x: i,
            // Use the ordinal number ranking for the chart data in order to create a bump chart
            y: rank,
            // TODO: don't add hintTitle and hintValue if score is null
            hintTitle: languageName,
            // Add the actual score as a separate property so it can be used for hints on mouseover
            hintValue: this._formatHintValue(score),
          }
        );
        formattedScoresIndex ++;
      }
    }

    return formattedScores;
  }

  static _getAllTopLanguages(topScores) {
    let allTopLanguages = [];

    for (let date in topScores) {
      for (let languageName in topScores[date]) {
        if (!allTopLanguages.includes(languageName)) {
          allTopLanguages.push(languageName);
        }
      }
    }

    return allTopLanguages;
  }

  _formatHintValue(hintValue) {
    return hintValue;
  }
}
