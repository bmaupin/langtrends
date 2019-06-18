import React from 'react';
import { Menu } from 'semantic-ui-react';

import ChartData from '../helpers/ChartData';

export default function ChartTopMenu(props) {
  const chartType = props.chartType;

  return (
    <Menu secondary>
      <Menu.Item
        name={ChartData.CHART_TYPES.FASTEST_OVER_1000}
        active={chartType === ChartData.CHART_TYPES.FASTEST_OVER_1000}
        onClick={props.handleItemClick}
      />
      <Menu.Item
        name={ChartData.CHART_TYPES.FASTEST_OVER_100}
        active={chartType === ChartData.CHART_TYPES.FASTEST_OVER_100}
        onClick={props.handleItemClick}
      />
      <Menu.Item
        name={ChartData.CHART_TYPES.TOP_LANGUAGES}
        active={chartType === ChartData.CHART_TYPES.TOP_LANGUAGES}
        onClick={props.handleItemClick}
      />
    </Menu>
  );
}
