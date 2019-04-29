import React, { Component } from 'react';
// TODO
import '../../node_modules/react-vis/dist/style.css';
import {
  FlexibleWidthXYPlot,
  Hint,
  HorizontalGridLines,
  LineMarkSeries,
  VerticalGridLines,
  XAxis,
  YAxis
} from 'react-vis';
import ChartData from '../helpers/ChartData';
import D3SigmoidCurve from '../helpers/D3SigmoidCurve';

import './Chart.css';

export default class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: [],
      dates: [],
      hintValue: null,
      yDomain: null,
    };

    this._onValueMouseOut = this._onValueMouseOut.bind(this);
    this._onValueMouseOver = this._onValueMouseOver.bind(this);
    this._xAxisLabelFormatter = this._xAxisLabelFormatter.bind(this);
    this._yAxisLabelFormatter = this._yAxisLabelFormatter.bind(this);
  }

  async componentDidMount() {
    await this.setChartData();
  }

  async setChartData() {
    const intervalInMonths = 3;

    // let chartData = await ApiHelper.getChartData(ApiHelper.CHART_TYPES.FASTEST_OVER_1000, intervalInMonths);
    // let chartData = new ChartData(ChartData.CHART_TYPES.TOP_LANGUAGES, intervalInMonths);
    let chartData = await ChartData.fromType(ChartData.CHART_TYPES.TOP_LANGUAGES, intervalInMonths);

    console.log(`chartData.dates=${chartData.dates}`)

    // TODO: just one object for chart data?
    this.setState({
      chartData: chartData.series,
      dates: chartData.dates,
      yDomain: chartData.yDomain,
    });
  }

  static _formatDateForLabel(date) {
    return date.toISOString().slice(0, 7);
  }

  _formatHint(value) {
    return [
      {
        title: value.hintTitle,
        value: value.hintValue,
      }
    ]
  }

  _onValueMouseOut() {
    this.setState({
      hintValue: null,
    });
  }

  _onValueMouseOver(value) {
    this.setState({
      hintValue: value,
    });
  }

  _xAxisLabelFormatter(_label, index) {
    console.log(`label=${_label}`)
    console.log(`index=${index}`)

    // TODO: somehow I've managed to break this...
    // return Chart._formatDateForLabel(this.state.dates[index]);
  }

  _yAxisLabelFormatter(label) {
    return this.state.chartData[label - 1].title;
  }

  // TODO: gracefully handle if API isn't available
  render() {
    const d3sigmoidcurve = D3SigmoidCurve.compression(0.5);
    return (
      <div className="chart-container">
        <div className="chart-content">
          <FlexibleWidthXYPlot
            height={500}
            margin={{right: 100}}
            yDomain={this.state.yDomain}
          >
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis tickFormat={this._xAxisLabelFormatter} tickTotal={this.state.chartData.length} />
            <YAxis orientation="right" tickFormat={this._yAxisLabelFormatter} />
            {this.state.chartData.map(entry =>
              <LineMarkSeries
                curve={d3sigmoidcurve}
                getNull={(d) => d.y !== null}
                key={entry.title}
                data={entry.data}
                onValueMouseOut={this._onValueMouseOut}
                onValueMouseOver={this._onValueMouseOver}
              />
            )}
            {this.state.hintValue &&
              <Hint
                format={this._formatHint}
                value={this.state.hintValue}
              />
            }
          </FlexibleWidthXYPlot>
        </div>
      </div>
    );
  }
}
