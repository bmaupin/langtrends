import React, { Component } from 'react';
import { Grid, Item } from 'semantic-ui-react';
import Chart from './Chart';
import ChartBottomMenu from './ChartBottomMenu';
import ChartTopMenu from './ChartTopMenu';

import './ChartGroup.css';

export default class ChartGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      intervalInMonths: 3
    };

    this.handleIntervalChanged = this.handleIntervalChanged.bind(this);
  }

  handleIntervalChanged(_event, { value }) {
    this.setState({ intervalInMonths: Number(value) });
  }

  render() {
    return (
      <Item.Group className="chart-group">
        <Item.Content>
          <Grid centered padded>
            <ChartTopMenu />
          </Grid>
          <Chart
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
    );
  }
}
