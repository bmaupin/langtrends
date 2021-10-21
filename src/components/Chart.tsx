import GitHubColors from 'github-colors';
import React, { Component } from 'react';
import {
  FlexibleWidthXYPlot,
  Hint,
  HorizontalGridLines,
  LineMarkSeries,
  VerticalGridLines,
  XAxis,
  YAxis,
} from 'react-vis';

import ChartFactory from '../helpers/ChartFactory';
import D3SigmoidCurve from '../helpers/D3SigmoidCurve';
import settings from '../settings.json';

import './Chart.css';
import '../../node_modules/react-vis/dist/style.css';

export default class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: [],
      dates: [],
      hintValue: null,
      hoveredSeriesIndex: null,
    };

    this._onValueMouseOut = this._onValueMouseOut.bind(this);
    this._onValueMouseOver = this._onValueMouseOver.bind(this);
    this._xAxisLabelFormatter = this._xAxisLabelFormatter.bind(this);
  }

  async componentDidMount() {
    await this.loadChartData();
  }

  async componentDidUpdate(prevProps) {
    // These conditionals prevent some extra flashing and wonkiness caused by reloading the chart data too aggressively
    if (
      this.props.chartType !== prevProps.chartType ||
      this.props.intervalInMonths !== prevProps.intervalInMonths
    ) {
      await this.loadChartData();
    }
  }

  async loadChartData() {
    this._chart = await ChartFactory.fromType(
      this.props.chartType,
      this.props.intervalInMonths
    );

    const dates = await this._chart.getDates();
    const series = await this._chart.getSeries();

    const leftYAxisLabels = Chart._generateLeftYAxisLabels(series);
    const rightYAxisLabels = Chart._generateRightYAxisLabels(series);

    // TODO: just one object for chart data?
    this.setState({
      chartData: series,
      dates: dates,
      leftYAxisLabels: leftYAxisLabels,
      rightYAxisLabels: rightYAxisLabels,
    });
  }

  static _generateLeftYAxisLabels(series) {
    return (
      series
        // Get just the data for the first date
        .map((languageData) => languageData.data[0])
        // Sort in reverse order because the y values are ordinal ranks (1 should be first, not 10)
        .sort((a, b) => b.y - a.y)
        // Drop everything else (x value, y value) and return just a list of hint titles
        .map((languageData) => languageData && languageData.hintTitle)
    );
  }

  // TODO: remove duplication here?
  static _generateRightYAxisLabels(series) {
    return (
      series
        // Get just the data for the last date
        .map((languageData) => languageData.data[languageData.data.length - 1])
        // Sort in reverse order because the y values are ordinal ranks (1 should be first, not 10)
        .sort((a, b) => b.y - a.y)
        // Drop everything else (x value, y value) and return just a list of hint titles
        .map((languageData) => languageData && languageData.hintTitle)
    );
  }

  _formatHint(value) {
    return [
      {
        title: value.hintTitle,
        value: value.hintValue,
      },
    ];
  }

  _onValueMouseOut() {
    this.setState({
      hintValue: null,
      hoveredSeriesIndex: null,
    });
  }

  _onValueMouseOver(value, index) {
    this.setState({
      hintValue: value,
      hoveredSeriesIndex: index,
    });
  }

  // TODO: could we just format the dates ahead of time and get rid of this method?
  _xAxisLabelFormatter(_value, index) {
    return Chart._formatDateForLabel(this.state.dates[index]);
  }

  static _formatDateForLabel(date) {
    return date.slice(0, 7);
  }

  render() {
    const d3sigmoidcurve = D3SigmoidCurve.compression(0.5);
    return (
      <div className="chart-container">
        <div className="chart-content">
          <FlexibleWidthXYPlot
            height={settings.numberOfLanguages * 49}
            margin={{
              left: 80,
              right: 80,
            }}
            // Reverse the y scale since we're doing a bump chart
            yDomain={[settings.numberOfLanguages, 1]}
          >
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis
              tickFormat={this._xAxisLabelFormatter}
              tickTotal={this.state.dates.length}
            />
            <YAxis
              orientation="left"
              tickFormat={(v, i) => this.state.leftYAxisLabels[i]}
            />
            <YAxis
              orientation="right"
              tickFormat={(v, i) => this.state.rightYAxisLabels[i]}
            />
            {this.state.chartData.map((entry, i) => (
              <LineMarkSeries
                curve={d3sigmoidcurve}
                getNull={(d) => d.y !== null}
                key={entry.title}
                color={GitHubColors.get(entry.title, true).color}
                data={entry.data}
                opacity={
                  this.state.hoveredSeriesIndex === null ||
                  this.state.hoveredSeriesIndex === i
                    ? 1
                    : 0.5
                }
                onValueMouseOut={this._onValueMouseOut}
                onValueMouseOver={(datapoint) =>
                  this._onValueMouseOver(datapoint, i)
                }
                strokeWidth={
                  this.state.hoveredSeriesIndex !== null &&
                  this.state.hoveredSeriesIndex === i
                    ? 4
                    : null
                }
                lineStyle={{ pointerEvents: 'none' }}
              />
            ))}
            {this.state.hintValue && (
              <Hint format={this._formatHint} value={this.state.hintValue} />
            )}
          </FlexibleWidthXYPlot>
        </div>
      </div>
    );
  }
}
