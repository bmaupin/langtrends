import React, { Component } from 'react';

import ChartGroup from './ChartGroup';
import TopMenu from './TopMenu';

class App extends Component {
  render() {
    return (
      <div className="App">
        <TopMenu />
        <ChartGroup />
      </div>
    );
  }
}

export default App;
