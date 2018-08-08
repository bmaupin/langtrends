import React, { Component } from 'react'
// TODO
import '../../node_modules/react-vis/dist/style.css';
import {
  Crosshair,
  DiscreteColorLegend,
  FlexibleWidthXYPlot,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  XAxis,
  YAxis
} from 'react-vis';

import './Chart.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const API_TOKEN = process.env.REACT_APP_API_TOKEN || null;
const NUMBER_OF_LANGUAGES = 10;

export default class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: [],
      crosshairValues: [],
      dates: [],
    };
  }

  async componentDidMount() {
    await this.setChartData();
  }

  async setChartData() {
    let chartData = [];
    let topLanguages = await ApiHelper.getTopLanguages();

    let dates = ApiHelper.buildDates(await ApiHelper._getLatestDateFromApi(), INTERVAL_QUARTERLY);
    let xAxisValues = dates.map(date => this._formatDateForLabel(date));

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
      dates: dates,
      xAxisValues: xAxisValues,
    });

    this._formatCrosshairItems = this._formatCrosshairItems.bind(this);
    this._formatCrosshairTitle = this._formatCrosshairTitle.bind(this);
  }

  _formatCrosshairItems(values) {
    const {chartData} = this.state;
    return values.map((v, i) => {
      return {
        title: chartData[i].title,
        value: v.y,
      };
    });
  }

  _formatCrosshairTitle(values) {
    const {dates} = this.state;
    return {
      title: 'Date',
      value: this._formatDateForLabel(dates[values[0].x]),
    };
  }

  _formatDateForLabel(date) {
    return date.toISOString().slice(0, 7);
  }

  _yAxisLabelFormatter(label) {
    return (Number(label) / 1000000).toFixed(1) + 'M';
  }

  // TODO: gracefully handle if API isn't available
  render() {
    return (
      <div className="chart-container">
        <div className="chart-content">
          <FlexibleWidthXYPlot
            height={500}
            margin={{right: 30}}
            onMouseLeave={() => this.setState({crosshairValues: []})}>
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis tickFormat={v => this.state.xAxisValues[v]} tickTotal={this.state.chartData.length} />
            <YAxis tickFormat={this._yAxisLabelFormatter} />
            {this.state.chartData.map(entry =>
              <LineSeries
                key={entry.title}
                data={entry.data}
                onNearestX={(value, {index}) =>
                  this.setState({crosshairValues: this.state.chartData.map(entry => entry.data[index])})}
              />
            )}
            <Crosshair
              itemsFormat={this._formatCrosshairItems}
              titleFormat={this._formatCrosshairTitle}
              values={this.state.crosshairValues} />
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
      currentDate = ApiHelper._subtractIntervalFromDate(currentDate, interval);
    }

    return dates.reverse();
  }

  static _subtractIntervalFromDate(date, interval) {
    switch (interval) {
      case INTERVAL_MONTHLY:
        return ApiHelper._subtractOneMonthUTC(date);
      case INTERVAL_QUARTERLY:
        return ApiHelper._subtractOneQuarterUTC(date);
      case INTERVAL_YEARLY:
        return ApiHelper._subtractOneYearUTC(date);
      default:
        throw new Error(`Error: interval ${interval} unimplemented`);
    }
  }

  static _buildScoresApiFilter(languageId, dates) {
    return {
      where: {
        and: [
          {languageId: languageId},
          {
            or: dates.map(date => ({date: date.toISOString()}))
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
      // This makes sure the language details get included. In particular we need the language name for labels
      include: 'language',
      order: 'points DESC',
      limit: NUMBER_OF_LANGUAGES,
    };
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
