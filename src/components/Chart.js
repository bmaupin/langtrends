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

    this._formatCrosshairItems = this._formatCrosshairItems.bind(this);
    this._formatCrosshairTitle = this._formatCrosshairTitle.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onNearestX = this._onNearestX.bind(this);
    this._xAxisLabelFormatter = this._xAxisLabelFormatter.bind(this);
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
    });
  }

  /**
   * A callback to format the crosshair items.
   *
   * Takes the crosshair values (set by _onNearestX) and format them for display, adding a title, etc.
   * @param {Object} values Array of values.
   * @returns {Array<Object>} Array of objects with titles and values.
   * @private
   */
  _formatCrosshairItems(values) {
    const chartData = this.state.chartData;
    let crossHairItems = values.map((v, i) => {
      return {
        title: chartData[i].title,
        value: v.y,
      };
    });

    crossHairItems.sort((a, b) => {return b.value - a.value});

    return crossHairItems;
  }

  _formatCrosshairTitle(values) {
    const dates = this.state.dates;
    return {
      title: 'Date',
      value: this._formatDateForLabel(dates[values[0].x]),
    };
  }

  _formatDateForLabel(date) {
    return date.toISOString().slice(0, 7);
  }

  _onMouseLeave() {
    this.setState({crosshairValues: []});
  }

  /**
   * Event handler for chart onNearestX.
   *
   * This will set the crosshair values based on the x coordinate closest to the user's mouse.
   * @param {Object} value Selected value.
   * @param {number} index Index of the series.
   * @private
   */
  _onNearestX(value, {index}) {
    const chartData = this.state.chartData;
    this.setState({
      crosshairValues: chartData.map(entry => entry.data[index])
    });
  }

  _xAxisLabelFormatter(index) {
    return this._formatDateForLabel(this.state.dates[index]);
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
            onMouseLeave={this._onMouseLeave}>
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis tickFormat={this._xAxisLabelFormatter} tickTotal={this.state.chartData.length} />
            <YAxis tickFormat={this._yAxisLabelFormatter} />
            {this.state.chartData.map(entry =>
              <LineSeries
                key={entry.title}
                data={entry.data}
                onNearestX={this._onNearestX}
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
