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
      >Fastest growing (&gt;1000)</Menu.Item>
      <Menu.Item
        name={ChartData.CHART_TYPES.FASTEST_OVER_100}
        active={chartType === ChartData.CHART_TYPES.FASTEST_OVER_100}
        onClick={props.handleItemClick}
      >Fastest growing (&gt;100)</Menu.Item>
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
