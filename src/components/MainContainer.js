import React, { Component } from 'react'
import { Container, Grid } from 'semantic-ui-react'
import ChartGroup from './ChartGroup';

export default class MainContainer extends Component {
  render() {
    return (
      <Container>
        <Grid centered padded>
          <ChartGroup />
        </Grid>
      </Container>
    )
  }
}
