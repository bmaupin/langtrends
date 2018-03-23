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
  async setChartData() {
    let chartData = [];

    let topLanguages = await apiHelper.getTopLanguages();

    for (let [languageId, languageName] of topLanguages) {
      chartData.push(await apiHelper.getScoresForLanguage(languageId));
    }

    this.setState({
      chartData: chartData,
    });
  }

  yAxisLabelFormatter(label) {
    return (Number(label) / 1000000).toFixed(1) + 'M';
  }

  // TODO: gracefully handle if API isn't available
  render() {
    // TODO: do this programatically
    const xAxisValues = ["2017-04-01", "2017-05-01", "2017-06-01", "2017-07-01", "2017-08-01", "2017-09-01", "2017-10-01", "2017-11-01", "2017-12-01", "2018-01-01", "2018-02-01", "2018-03-01"];

    // TODO: make this responsive
    return (
      <div className="App">
        <XYPlot height={500} width={900}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis tickFormat={v => xAxisValues[v]} tickTotal={this.state.chartData.length} />
          <YAxis tickFormat={this.yAxisLabelFormatter} />
          {this.state.chartData.map(seriesData => <LineSeries data={seriesData} />)}
        </XYPlot>
      </div>
    );
  }
}

const API_BASE_URL = 'http://localhost:3000';

const INTERVAL_MONTHLY = 'monthly';
const INTERVAL_QUARTERLY = 'quarterly';
const INTERVAL_YEARLY = 'yearly';

// TODO: this probably needs to be split out of React
class apiHelper {
  static async getScoresForLanguage(languageId) {
    let scores = [];
    let dates = apiHelper.buildDates(apiHelper._getFirstDayOfMonthUTC(), INTERVAL_MONTHLY);
    let response = await fetch(apiHelper.buildScoresApiUrl(languageId, dates));
    let scoresFromApi = await response.json();

    // Sort by date, oldest first (the dates probably won't be in order)
    scoresFromApi.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    for (let i = 0; i < scoresFromApi.length; i++) {
      scores.push(
        {
          x: scores.length,
          y: scoresFromApi[i].points
        }
      )
    }

    return scores;
  }

  static buildDates(lastDate, interval) {
    switch (interval) {
      case INTERVAL_MONTHLY:
        let dates = [];
        let currentDate = lastDate;
        // TODO: magic number
        for (let i = 0; i < 12; i++) {
          dates.push(currentDate);
          currentDate = apiHelper._subtractOneMonthUTC(currentDate);
        }
        return dates.reverse();
        break;
      default:
        throw `Error: interval ${interval} unimplemented`;
    }
  }

  static buildScoresApiUrl(languageId, dates) {
    let scoresApiUrl = `${API_BASE_URL}/api/scores?filter[where][and][0][languageId]=${languageId}`

    for (let i = 0; i < dates.length; i++) {
      scoresApiUrl += `&filter[where][or][${i}][date]=${dates[i]}`
    }

    return scoresApiUrl;
  }

  static async getTopLanguages() {
    let topLanguages = new Map();
    const firstDayofMonth = apiHelper._getFirstDayOfMonthUTC();
    let response = await fetch(`http://localhost:3000/api/scores?filter[where][date]=${firstDayofMonth}&filter[include]=language&filter[order]=points%20DESC&filter[limit]=10`);
    let topScores = await response.json();

    for (let i = 0 ; i < topScores.length; i++) {
      topLanguages.set(topScores[i].language.id, topScores[i].language.name);
    }

    return topLanguages;
  }

  static _getFirstDayOfMonthUTC() {
    return new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth()));
  }

  static _subtractOneMonthUTC(date) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - 1);
    return newDate;
  }

  static _subtractOneYearUTC(date) {
    let newDate = new Date(date);
    newDate.setUTCFullYear(newDate.getUTCFullYear() - 1);
    return newDate;
  }
}
