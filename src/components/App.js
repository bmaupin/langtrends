import React, { Component } from 'react';

import ChartGroup from './ChartGroup';
import Header from './Header';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <ChartGroup />
      </div>
    );
  }
}

export default App;
