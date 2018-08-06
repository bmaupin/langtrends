import React, { Component } from 'react'
// TODO
import '../../node_modules/react-vis/dist/style.css';
import { DiscreteColorLegend, FlexibleWidthXYPlot, HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, YAxis } from 'react-vis';

import './Chart.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;

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

    let dates = ApiHelper.buildDates(await ApiHelper._getLatestDateFromApi(), INTERVAL_QUARTERLY);
    let xAxisValues = dates.map(date => date.toISOString().slice(0, 7));

    for (let [languageId, languageName] of topLanguages) {
      chartData.push(
        {
          title: languageName,
          data: await ApiHelper.getScoresForLanguage(languageId, dates),
        }
      );
    }

    // TODO
    console.log(`chartData=${JSON.stringify(chartData)}`);

    this.setState({
      chartData: chartData,
      xAxisValues: xAxisValues,
    });
  }

  yAxisLabelFormatter(label) {
    return (Number(label) / 1000000).toFixed(1) + 'M';
  }

  // TODO: gracefully handle if API isn't available
  render() {
    return (
      <div className="chart-container">
        <div className="chart-content">
          <FlexibleWidthXYPlot height={500} margin={{right: 30}}>
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis tickFormat={v => this.state.xAxisValues[v]} tickTotal={this.state.chartData.length} />
            <YAxis tickFormat={this.yAxisLabelFormatter} />
            {this.state.chartData.map(entry =>
              <LineSeries
                key={entry.title}
                data={entry.data}
              />
            )}
          </FlexibleWidthXYPlot>
        </div>

        <div className="chart-legend">
          <DiscreteColorLegend
            width={180}
            items={this.state.chartData} />
        </div>
      </div>
    );
  }
}

const INTERVAL_MONTHLY = 'monthly';
const INTERVAL_QUARTERLY = 'quarterly';
const INTERVAL_YEARLY = 'yearly';

// TODO: this probably needs to be split out of the component
class ApiHelper {
  static async getScoresForLanguage(languageId, dates) {
    let scores = [];
    let scoresApiFilter = ApiHelper._buildScoresApiFilter(languageId, dates);
    let scoresFromApi = await ApiHelper._callApi(scoresApiFilter);

    // Sort by date, oldest first (the dates probably won't be in order)
    scoresFromApi.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    for (let i = 0; i < scoresFromApi.length; i++) {
      scores.push(
        {
          // The x axis values must be numbers
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
          throw new Error(`Error: interval ${interval} unimplemented`);
      }
    }

    return dates.reverse();
  }

  static _buildScoresApiFilter(languageId, dates) {
    return {
      where: {
        and: [
          { languageId: languageId },
          {
            or: dates.map(date => ({ date: date.toISOString() }))
          }
        ]
      }
    }
  }

  static async _callApi(filter) {
    let apiUrl = encodeURI(`${API_BASE_URL}/api/scores?filter=${JSON.stringify(filter)}&access_token=${API_TOKEN}`);

    let response = await fetch(apiUrl);
    return response.json();
  }

  static async getTopLanguages() {
    let topLanguages = new Map();
    const latestDateFromApi = await ApiHelper._getLatestDateFromApi();

    let filter = {
      where: {
        date: latestDateFromApi.toISOString(),
      },
      include: 'language',
      order: 'points DESC',
      limit: 10,
    }
    let topScores = await ApiHelper._callApi(filter);

    for (let i = 0; i < topScores.length; i++) {
      topLanguages.set(topScores[i].language.id, topScores[i].language.name);
    }

    return topLanguages;
  }

  static async _getLatestDateFromApi() {
    let filter = {
      order: 'date DESC',
      limit: 1
    }
    let scoresFromApi = await ApiHelper._callApi(filter);

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
