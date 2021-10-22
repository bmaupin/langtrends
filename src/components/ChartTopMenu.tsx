import React from 'react';
import { Menu, MenuItemProps } from 'semantic-ui-react';

import { ChartType } from '../helpers/ChartFactory';

export default function ChartTopMenu(props: {
  chartType: string | undefined;
  handleItemClick: (
    event: React.MouseEvent<HTMLElement>,
    data: MenuItemProps
  ) => void;
}) {
  const chartType = props.chartType;

  return (
    <Menu secondary>
      <Menu.Item
        name={ChartType.FastestGrowth}
        active={chartType === ChartType.FastestGrowth}
        onClick={props.handleItemClick}
      >
        Fastest growth
      </Menu.Item>
      <Menu.Item
        name={ChartType.MostGrowth}
        active={chartType === ChartType.MostGrowth}
        onClick={props.handleItemClick}
      >
        Most growth
      </Menu.Item>
      <Menu.Item
        name={ChartType.TopLanguages}
        active={chartType === ChartType.TopLanguages}
        onClick={props.handleItemClick}
      >
        Top
      </Menu.Item>
    </Menu>
  );
}
