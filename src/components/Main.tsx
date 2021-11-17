import React, { useState } from 'react';
import { ButtonProps, Container, Grid, Item } from 'semantic-ui-react';

import BottomButtonGroup from './BottomButtonGroup';
import Chart from './Chart';
import TopButtonGroup from './TopButtonGroup';
import { ChartType } from '../helpers/ChartFactory';

import './Main.css';

export default function Main() {
  const [chartType, setChartType] = useState(ChartType.MostGrowth as string);
  const [intervalInMonths, setIntervalInMonths] = useState(3);

  const handleChartTypeChanged = (
    _event: React.MouseEvent<HTMLElement>,
    { name }: ButtonProps
  ) => {
    if (name) {
      setChartType(name);
    }
  };

  const handleIntervalChanged = (
    _event: React.MouseEvent<HTMLElement>,
    { value }: ButtonProps
  ) => {
    setIntervalInMonths(Number(value));
  };

  return (
    <Container>
      <Grid centered padded>
        <Item.Group className="main">
          <Item.Content>
            <Grid centered className="button-group-grid">
              <TopButtonGroup
                chartType={chartType}
                handleItemClick={handleChartTypeChanged}
              />
            </Grid>
            <Chart chartType={chartType} intervalInMonths={intervalInMonths} />
            <Grid centered className="button-group-grid">
              <BottomButtonGroup
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
