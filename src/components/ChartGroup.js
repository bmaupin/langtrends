import React, { Component } from 'react';
import { Container, Grid, Item } from 'semantic-ui-react';

import Chart from './Chart';
import ChartBottomMenu from './ChartBottomMenu';
import ChartData from '../helpers/ChartData';
import ChartTopMenu from './ChartTopMenu';

import './ChartGroup.css';

export default class ChartGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartType: ChartData.CHART_TYPES.FASTEST_OVER_1000,
      intervalInMonths: 3,
    };

    this.handleChartTypeChanged = this.handleChartTypeChanged.bind(this);
    this.handleIntervalChanged = this.handleIntervalChanged.bind(this);
  }

  handleChartTypeChanged(_event, { name }) {
    this.setState({ chartType: name });
  }

  handleIntervalChanged(_event, { value }) {
    this.setState({ intervalInMonths: Number(value) });
  }

  render() {
    return (
      <Container>
        <Grid centered padded>
          <Item.Group className="chart-group">
            <Item.Content>
              <Grid centered padded>
                <ChartTopMenu
                  chartType={this.state.chartType}
                  handleItemClick={this.handleChartTypeChanged}
                />
              </Grid>
              <Chart
                chartType={this.state.chartType}
                intervalInMonths={this.state.intervalInMonths}
              />
              <Grid centered padded>
                <ChartBottomMenu
                  handleItemClick={this.handleIntervalChanged}
                  intervalInMonths={this.state.intervalInMonths}
                />
              </Grid>
            </Item.Content>
          </Item.Group>
        </Grid>
      </Container>
    );
  }
}
