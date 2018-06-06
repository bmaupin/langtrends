import React, { Component } from 'react'
import { Grid, Item } from 'semantic-ui-react'
import Chart from './Chart';
import ChartTopMenu from './ChartTopMenu';

import './ChartGroup.css';

export default class ChartGroup extends Component {
  render() {
    return (
      <Item.Group className="chart-group">
        <Item.Content>
          <Grid centered padded>
            <ChartTopMenu />
          </Grid>
          <Chart />
        </Item.Content>
      </Item.Group>
    )
  }
}
