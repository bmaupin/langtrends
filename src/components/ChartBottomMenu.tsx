import React from 'react';
import { Menu } from 'semantic-ui-react';

export default function ChartBottomMenu(props) {
  const intervalInMonths = props.intervalInMonths;

  return (
    <Menu secondary>
      <Menu.Item name='monthly' value='1' active={intervalInMonths === 1} onClick={props.handleItemClick} />
      <Menu.Item name='quarterly' value='3' active={intervalInMonths === 3} onClick={props.handleItemClick} />
      <Menu.Item name='yearly' value='12' active={intervalInMonths === 12} onClick={props.handleItemClick} />
    </Menu>
  );
}
