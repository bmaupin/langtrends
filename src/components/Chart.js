import React, { Component } from 'react'
// TODO
import '../../node_modules/react-vis/dist/style.css';
import { HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from 'react-vis';
import { Image } from 'semantic-ui-react'

const API_BASE_URL = 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN;

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

  async setChartData() {
    let chartData = [];

    let topLanguages = await ApiHelper.getTopLanguages();

    for (let [languageId, languageName] of topLanguages) {
      chartData.push(await ApiHelper.getScoresForLanguage(languageId));
    }

    // TODO
    console.log(`chartData=${chartData}`);

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
    // const xAxisValues = ["2017-04-01", "2017-05-01", "2017-06-01", "2017-07-01", "2017-08-01", "2017-09-01", "2017-10-01", "2017-11-01", "2017-12-01", "2018-01-01", "2018-02-01", "2018-03-01"];

    // TODO: make this responsive
    return (
      <div className="App">
        <XYPlot height={500} width={900}>
          <VerticalGridLines />
          <HorizontalGridLines />
          {/*<XAxis tickFormat={v => xAxisValues[v]} tickTotal={this.state.chartData.length} />*/}
          <XAxis tickTotal={this.state.chartData.length} />
          <YAxis tickFormat={this.yAxisLabelFormatter} />
          {this.state.chartData.map(seriesData => <LineSeries data={seriesData} />)}
        </XYPlot>
      </div>
    );
  }
}

const INTERVAL_MONTHLY = 'monthly';
const INTERVAL_QUARTERLY = 'quarterly';
const INTERVAL_YEARLY = 'yearly';

// TODO: this probably needs to be split out of the component
class ApiHelper {
  static async getScoresForLanguage(languageId) {
    let scores = [];
    let dates = ApiHelper.buildDates(await ApiHelper._getLatestDateFromApi(), INTERVAL_QUARTERLY);
    let response = await fetch(ApiHelper.buildScoresApiUrl(languageId, dates));
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
    let dates = [];
    let currentDate = lastDate;

    // TODO: magic number?
    for (let i = 0; i < 12; i++) {
      dates.push(currentDate);

      switch (interval) {
        case INTERVAL_MONTHLY:
          currentDate = ApiHelper._subtractOneMonthUTC(currentDate);
          break;
        case INTERVAL_QUARTERLY:
          currentDate = ApiHelper._subtractOneQuarterUTC(currentDate);
          break;
        case INTERVAL_YEARLY:
          currentDate = ApiHelper._subtractOneYearUTC(currentDate);
          break;
        default:
          throw `Error: interval ${interval} unimplemented`;
      }
    }

    return dates.reverse();
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
    const latestDateFromApi = await ApiHelper._getLatestDateFromApi();
    let response = await fetch(`${API_BASE_URL}/api/scores?filter[where][date]=${latestDateFromApi.toISOString()}&filter[include]=language&filter[order]=points%20DESC&filter[limit]=10&access_token=${API_TOKEN}`);
    let topScores = await response.json();

    for (let i = 0 ; i < topScores.length; i++) {
      topLanguages.set(topScores[i].language.id, topScores[i].language.name);
    }

    return topLanguages;
  }

  static async _getLatestDateFromApi() {
    let filter = {
      order: 'date DESC',
      limit: 1
    }
    let apiUrl = encodeURI(`${API_BASE_URL}/api/scores?filter=${JSON.stringify(filter)}&access_token=${API_TOKEN}`);

    let response = await fetch(apiUrl);
    let scoresFromApi = await response.json();
    return new Date(scoresFromApi[0].date);
  }

  static _subtractOneMonthUTC(date) {
    return ApiHelper._subtractMonthsUTC(date, 1);
  }

  static _subtractOneQuarterUTC(date) {
    return ApiHelper._subtractMonthsUTC(date, 3);
  }

  static _subtractOneYearUTC(date) {
    return ApiHelper._subtractMonthsUTC(date, 12);
  }

  static _subtractMonthsUTC(date, monthsToSubtract) {
    let newDate = new Date(date);
    newDate.setUTCMonth(newDate.getUTCMonth() - monthsToSubtract);
    return newDate;
  }
}
