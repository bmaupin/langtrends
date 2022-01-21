import React, { Dispatch, SetStateAction } from 'react';
import { Button, ButtonProps, Grid } from 'semantic-ui-react';

import './ButtonGroup.css';

export default function BottomButtonGroup(props: {
  changeInterval: (
    event: React.MouseEvent<HTMLElement>,
    data: ButtonProps
  ) => void;
  incrementFirstLanguageIndex: () => void;
  intervalInMonths: number;
}) {
  const intervalInMonths = props.intervalInMonths;

  return (
    <Grid centered>
      <Grid.Column width={1}></Grid.Column>
      <Grid.Column width={13}>
        <Grid centered>
          <Button.Group basic className="button-group">
            <Button
              value="1"
              active={intervalInMonths === 1}
              onClick={props.changeInterval}
            >
              Monthly
            </Button>
            <Button
              value="3"
              active={intervalInMonths === 3}
              onClick={props.changeInterval}
            >
              Quarterly
            </Button>
            <Button
              value="12"
              active={intervalInMonths === 12}
              onClick={props.changeInterval}
            >
              Yearly
            </Button>
          </Button.Group>
        </Grid>
      </Grid.Column>
      <Grid.Column width={1}>
        <Button
          circular
          icon="arrow down"
          onClick={() => {
            props.incrementFirstLanguageIndex();
          }}
        />
      </Grid.Column>
    </Grid>
  );
}
