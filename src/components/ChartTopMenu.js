import React from 'react';
import { Menu } from 'semantic-ui-react';

import ChartData from '../helpers/ChartData';

export default function ChartTopMenu(props) {
  const chartType = props.chartType;

  return (
    <Menu secondary>
      <Menu.Item
        name={ChartData.CHART_TYPES.FASTEST_GROWTH}
        active={chartType === ChartData.CHART_TYPES.FASTEST_GROWTH}
        onClick={props.handleItemClick}
      >Fastest growth</Menu.Item>
      <Menu.Item
        name={ChartData.CHART_TYPES.MOST_GROWTH}
        active={chartType === ChartData.CHART_TYPES.MOST_GROWTH}
        onClick={props.handleItemClick}
      >Most growth</Menu.Item>
      <Menu.Item
        name={ChartData.CHART_TYPES.TOP_LANGUAGES}
        active={chartType === ChartData.CHART_TYPES.TOP_LANGUAGES}
        onClick={props.handleItemClick}
      >Top</Menu.Item>
    </Menu>
  );
}
