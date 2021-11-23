import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonProps, Container, Grid, Item } from 'semantic-ui-react';

import BottomButtonGroup from './BottomButtonGroup';
import Chart from './Chart';
import TopButtonGroup from './TopButtonGroup';
import { ChartType } from '../helpers/ChartFactory';

import './Main.css';

export default function Main() {
  // Store the chart type/interval directly in the search params so we don't have to maintain separate state for them
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultChartType = ChartType.MostGrowth;
  const defaultInterval = 3;

  const handleChartTypeChanged = (
    _event: React.MouseEvent<HTMLElement>,
    { name }: ButtonProps
  ) => {
    if (name) {
      // Setting the search params this way allows us to set certain params without overriding the others
      searchParams.set('chart_type', name);
      setSearchParams(searchParams);
    }
  };

  const handleIntervalChanged = (
    _event: React.MouseEvent<HTMLElement>,
    { value }: ButtonProps
  ) => {
    searchParams.set('interval', value);
    setSearchParams(searchParams);
  };

  return (
    <Container>
      <Grid centered padded>
        <Item.Group className="main">
          <Item.Content>
            <Grid centered className="button-group-grid">
              <TopButtonGroup
                chartType={searchParams.get('chart_type') ?? defaultChartType}
                handleItemClick={handleChartTypeChanged}
              />
            </Grid>
            <Chart
              chartType={searchParams.get('chart_type') ?? defaultChartType}
              intervalInMonths={Number(
                searchParams.get('interval') || defaultInterval
              )}
            />
            <Grid centered className="button-group-grid">
              <BottomButtonGroup
                handleItemClick={handleIntervalChanged}
                intervalInMonths={Number(
                  searchParams.get('interval') || defaultInterval
                )}
              />
            </Grid>
          </Item.Content>
        </Item.Group>
      </Grid>
    </Container>
  );
}
