import React from 'react';
import { Button, ButtonProps } from 'semantic-ui-react';

import './ButtonGroup.css';
import { ChartType } from '../helpers/ChartFactory';

export default function TopButtonGroup(props: {
  chartType: string | undefined;
  handleItemClick: (
    event: React.MouseEvent<HTMLElement>,
    data: ButtonProps
  ) => void;
}) {
  const chartType = props.chartType;

  return (
    <Button.Group basic className="button-group">
      <Button
        name={ChartType.FastestGrowth}
        active={chartType === ChartType.FastestGrowth}
        onClick={props.handleItemClick}
      >
        Fastest growth
      </Button>
      <Button
        name={ChartType.MostGrowth}
        active={chartType === ChartType.MostGrowth}
        onClick={props.handleItemClick}
      >
        Most growth
      </Button>
      <Button
        name={ChartType.TopLanguages}
        active={chartType === ChartType.TopLanguages}
        onClick={props.handleItemClick}
      >
        Top
      </Button>
    </Button.Group>
  );
}
