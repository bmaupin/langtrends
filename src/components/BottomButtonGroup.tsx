import React from 'react';
import { Button, ButtonProps } from 'semantic-ui-react';

import './ButtonGroup.css';

export default function BottomButtonGroup(props: {
  intervalInMonths: number;
  handleItemClick: (
    event: React.MouseEvent<HTMLElement>,
    data: ButtonProps
  ) => void;
}) {
  const intervalInMonths = props.intervalInMonths;

  return (
    <Button.Group basic className="button-group">
      <Button
        value="1"
        active={intervalInMonths === 1}
        onClick={props.handleItemClick}
      >
        Monthly
      </Button>
      <Button
        value="3"
        active={intervalInMonths === 3}
        onClick={props.handleItemClick}
      >
        Quarterly
      </Button>
      <Button
        value="12"
        active={intervalInMonths === 12}
        onClick={props.handleItemClick}
      >
        Yearly
      </Button>
    </Button.Group>
  );
}
