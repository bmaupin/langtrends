import React, { Component } from 'react'
import { Image } from 'semantic-ui-react'

export default class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: [],
    };
  }

  async componentDidMount() {
    await this.setChartData();
  }

  // TODO: this probably needs to be split out of React
  async getTopLanguages() {
    let topLanguages = new Map();
    let response = await fetch('http://localhost:3000/api/scores?filter[where][date]=2018-02-01T00:00:00.000Z&filter[include]=language&filter[order]=points%20DESC&filter[limit]=10');
    let topScores = await response.json();

    for (let i = 0 ; i < topScores.length; i++) {
      topLanguages.set(topScores[i].language.id, topScores[i].language.name);
    }

    return topLanguages;
  }

  // TODO data needs to look like this
  /*
  const seriesOne = [
    {x: 1, y: 10},
    {x: 2, y: 0},
    {x: 3, y: 15}
  ];

  const seriesTwo = [
    {x: 1, y: 10},
    {x: 2, y: 5},
    {x: 3, y: 15}
  ];

  const seriesThree = [
    {x: 1, y: 0},
    {x: 2, y: 0},
    {x: 3, y: 15}
  ];
  */
  // TODO: make sure X matches for all scores
  async setChartData() {
    let chartData = [];

    let topLanguages = await this.getTopLanguages();

    for (let [languageId, languageName] of topLanguages) {
      // TODO: magic number
      chartData.push(await this.getScoresForLanguage(languageId, 12));
      // TODO
      if (chartData.length === 2) {
        break;
      }
    }

    this.setState({
      chartData: chartData,
    });
  }

  async getScoresForLanguage(languageId, numScores) {
    let scores = [];
    let response = await fetch(`http://localhost:3000/api/scores?filter[where][and][0][date][gte]=2017-02-01T00:00:00.000Z&filter[where][and][1][languageId]=${languageId}&filter[include]=language`);
    let scoresFromApi = await response.json();

    // Sort by date, oldest first
    scoresFromApi.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    for (let i = 0 ; i < scoresFromApi.length; i++) {
      scores.push(
        {
          x: scores.length + 1,
          y: scoresFromApi[i].points
        }
      )

      if (scores.length === numScores) {
        break;
      }
    }

    return scores;
  }

  // TODO: gracefully handle if API isn't available
  render() {
    return (
      <code>{JSON.stringify(this.state.chartData)}</code>
    )
  }
}
