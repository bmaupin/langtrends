import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonProps, Container, Grid, Item } from 'semantic-ui-react';

import BottomButtonGroup from './BottomButtonGroup';
import Chart from './Chart';
import TopButtonGroup from './TopButtonGroup';
import { ChartType } from '../helpers/ChartFactory';

import './Main.css';

export default function Main() {
  // Index of the first language shown in the chart so we can show more than just the top 10 languages
  const [firstLanguageIndex, setFirstLanguageIndex] = useState(0);
  // Maximum language index; used to prevent going beyond the end of the data
  const [maxLanguageIndex, setMaxLanguageIndex] = useState(
    null as number | null
  );
  // Store the chart type/interval directly in the search params so we don't have to maintain separate state for them
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultChartType = ChartType.MostGrowth;
  const defaultInterval = 3;

  const changeChartType = (
    _event: React.MouseEvent<HTMLElement>,
    { name }: ButtonProps
  ) => {
    if (name) {
      // Setting the search params this way allows us to set certain params without overriding the others
      searchParams.set('chart_type', name);
      setSearchParams(searchParams);
      setFirstLanguageIndex(0);
    }
  };

  const changeInterval = (
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
            <TopButtonGroup
              changeChartType={changeChartType}
              chartType={searchParams.get('chart_type') ?? defaultChartType}
              firstLanguageIndex={firstLanguageIndex}
              setFirstLanguageIndex={setFirstLanguageIndex}
            />
            <Chart
              chartType={searchParams.get('chart_type') ?? defaultChartType}
              firstLanguageIndex={firstLanguageIndex}
              intervalInMonths={Number(
                searchParams.get('interval') || defaultInterval
              )}
              setMaxLanguageIndex={setMaxLanguageIndex}
            />
            <BottomButtonGroup
              changeInterval={changeInterval}
              firstLanguageIndex={firstLanguageIndex}
              intervalInMonths={Number(
                searchParams.get('interval') || defaultInterval
              )}
              maxLanguageIndex={maxLanguageIndex}
              setFirstLanguageIndex={setFirstLanguageIndex}
            />
          </Item.Content>
        </Item.Group>
      </Grid>
    </Container>
  );
}
