import React, { Dispatch, SetStateAction } from 'react';
import { Button, ButtonProps, Grid, Popup } from 'semantic-ui-react';

import './ButtonGroup.css';
import { ChartType } from '../helpers/ChartFactory';

export default function TopButtonGroup(props: {
  changeChartType: (
    event: React.MouseEvent<HTMLElement>,
    data: ButtonProps
  ) => void;
  chartType: string | undefined;
  firstLanguageIndex: number;
  setFirstLanguageIndex: Dispatch<SetStateAction<number>>;
}) {
  const chartType = props.chartType;

  return (
    <Grid centered>
      <Grid.Column width={1}></Grid.Column>
      <Grid.Column width={13}>
        <Grid centered>
          <Button.Group basic className="button-group">
            <Button
              name={ChartType.FastestGrowth}
              active={chartType === ChartType.FastestGrowth}
              onClick={props.changeChartType}
            >
              Fastest growth
            </Button>
            <Button
              name={ChartType.MostGrowth}
              active={chartType === ChartType.MostGrowth}
              onClick={props.changeChartType}
            >
              Most growth
            </Button>
            <Button
              name={ChartType.TopLanguages}
              active={chartType === ChartType.TopLanguages}
              onClick={props.changeChartType}
            >
              Top
            </Button>
          </Button.Group>
        </Grid>
      </Grid.Column>
      <Grid.Column width={1}>
        <Popup
          content="Show previous language"
          on="hover"
          trigger={
            <Button
              circular
              disabled={!props.firstLanguageIndex}
              icon="arrow up"
              onClick={() => {
                props.setFirstLanguageIndex((index) => index - 1);
              }}
            />
          }
        />
      </Grid.Column>
    </Grid>
  );
}
