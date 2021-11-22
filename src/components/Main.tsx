import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonProps, Container, Grid, Item } from 'semantic-ui-react';

import BottomButtonGroup from './BottomButtonGroup';
import Chart from './Chart';
import TopButtonGroup from './TopButtonGroup';
import { ChartType } from '../helpers/ChartFactory';

import './Main.css';

export default function Main() {
  // Keep a separate state outside searchParams for chartType and intervalInMonths so, for example, if someone just
  // loads the default page we can use the default values without having to modify the URL
  const [chartType, setChartType] = useState(ChartType.MostGrowth as string);
  const [intervalInMonths, setIntervalInMonths] = useState(3);
  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (
      searchParams.get('interval') &&
      Number(searchParams.get('interval')) !== intervalInMonths
    ) {
      setIntervalInMonths(Number(searchParams.get('interval')!));
    }

    if (
      searchParams.get('chart_type') &&
      searchParams.get('chart_type') !== chartType
    ) {
      setChartType(searchParams.get('chart_type')!);
    }
  }, [chartType, intervalInMonths, searchParams]);

  const handleChartTypeChanged = (
    _event: React.MouseEvent<HTMLElement>,
    { name }: ButtonProps
  ) => {
    if (name) {
      setChartType(name);
      // Setting the search params this way allows us to set certain params without overriding the others
      searchParams.set('chart_type', name);
      setSearchParams(searchParams);
    }
  };

  const handleIntervalChanged = (
    _event: React.MouseEvent<HTMLElement>,
    { value }: ButtonProps
  ) => {
    setIntervalInMonths(Number(value));
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
