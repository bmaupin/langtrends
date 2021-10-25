import React, { useState } from 'react';
import { Container, Grid, Item, MenuItemProps } from 'semantic-ui-react';

import Chart from './Chart';
import ChartBottomMenu from './ChartBottomMenu';
import { ChartType } from '../helpers/ChartFactory';
import ChartTopMenu from './ChartTopMenu';

import './ChartGroup.css';

export default function ChartGroup() {
  const [chartType, setChartType] = useState(ChartType.MostGrowth as string);
  const [intervalInMonths, setIntervalInMonths] = useState(3);

  const handleChartTypeChanged = (
    _event: React.MouseEvent<HTMLElement>,
    { name }: MenuItemProps
  ) => {
    if (name) {
      setChartType(name);
    }
  };

  const handleIntervalChanged = (
    _event: React.MouseEvent<HTMLElement>,
    { value }: MenuItemProps
  ) => {
    setIntervalInMonths(Number(value));
  };

  return (
    <Container>
      <Grid centered padded>
        <Item.Group className="chart-group">
          <Item.Content>
            <Grid centered padded>
              <ChartTopMenu
                chartType={chartType}
                handleItemClick={handleChartTypeChanged}
              />
            </Grid>
            <Chart chartType={chartType} intervalInMonths={intervalInMonths} />
            <Grid centered padded>
              <ChartBottomMenu
                handleItemClick={handleIntervalChanged}
                intervalInMonths={intervalInMonths}
              />
            </Grid>
          </Item.Content>
        </Item.Group>
      </Grid>
    </Container>
  );
}
