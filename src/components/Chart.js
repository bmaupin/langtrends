import React, { Component } from 'react'
import { Image } from 'semantic-ui-react'

export default class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topLanguages: {},
    };

    this.getTopLanguages = this.getTopLanguages.bind(this);
  }

  async componentDidMount() {
    this.setState({
      topLanguages: await this.getTopLanguages(),
    });
  }

  // TODO: this probably needs to be split out of React
  async getTopLanguages() {
    // TODO: this doesn't preserve order
    let topLanguages = {};
    let response = await fetch('http://localhost:3000/api/scores?filter[where][date]=2018-02-01T00:00:00.000Z&filter[include]=language&filter[order]=points%20DESC&filter[limit]=10');
    let topScores = await response.json();

    for (let i = 0 ; i < topScores.length; i++) {
      topLanguages[topScores[i].language.id] = topScores[i].language.name;
    }

    return topLanguages;
  }

  // TODO: gracefully handle if API isn't available
  render() {
    return (
      <code>{JSON.stringify(this.state.topLanguages)}</code>
    )
  }
}
