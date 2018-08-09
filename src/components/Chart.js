import React, { Component } from 'react';
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
import ApiHelper from '../helpers/ApiHelper';

import './Chart.css';

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
    const interval = ApiHelper.INTERVAL_QUARTERLY;
    let chartData = [];
    let topLanguages = await ApiHelper.getTopLanguages();
    // let topLanguages = await ApiHelper.getFastestGrowingLanguages(await ApiHelper._getLatestDateFromApi(), interval);

    let dates = ApiHelper.buildDates(await ApiHelper._getLatestDateFromApi(), interval);
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
