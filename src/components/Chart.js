import React, { Component } from 'react'
// TODO
import '../../node_modules/react-vis/dist/style.css';
import { HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from 'react-vis';
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

  yAxisLabelFormatter(label) {
    return (Number(label) / 1000000).toFixed(1) + 'M'
  }

  // TODO: gracefully handle if API isn't available
  render() {
    // TODO: do this programatically
    const xAxisValues = ["2017-04-01", "2017-05-01", "2017-06-01", "2017-07-01", "2017-08-01", "2017-09-01", "2017-10-01", "2017-11-01", "2017-12-01", "2018-01-01", "2018-02-01", "2018-03-01"];

    // TODO: this isn't responsive
    return (
      <div className="App">
        <XYPlot height={500} width={900}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis tickFormat={v => xAxisValues[v - 1]} tickTotal={this.state.chartData.length} />
          <YAxis tickFormat={this.yAxisLabelFormatter} />
          {this.state.chartData.map(seriesData => <LineSeries data={seriesData} />)}
        </XYPlot>
      </div>
    );
  }
}
