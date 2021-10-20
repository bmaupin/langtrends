import React from 'react';
import { Menu } from 'semantic-ui-react';

import ChartFactory from '../helpers/ChartFactory';

export default function ChartTopMenu(props) {
  const chartType = props.chartType;

  return (
    <Menu secondary>
      <Menu.Item
        name={ChartFactory.CHART_TYPES.FASTEST_GROWTH}
        active={chartType === ChartFactory.CHART_TYPES.FASTEST_GROWTH}
        onClick={props.handleItemClick}
      >Fastest growth</Menu.Item>
      <Menu.Item
        name={ChartFactory.CHART_TYPES.MOST_GROWTH}
        active={chartType === ChartFactory.CHART_TYPES.MOST_GROWTH}
        onClick={props.handleItemClick}
      >Most growth</Menu.Item>
      <Menu.Item
        name={ChartFactory.CHART_TYPES.TOP_LANGUAGES}
        active={chartType === ChartFactory.CHART_TYPES.TOP_LANGUAGES}
        onClick={props.handleItemClick}
      >Top</Menu.Item>
    </Menu>
  );
}
