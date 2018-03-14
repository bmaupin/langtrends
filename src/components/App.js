import React, { Component } from 'react';
import MainContainer from './MainContainer';
import TopMenu from './TopMenu';

class App extends Component {
  render() {
    return (
      <div className="App">
        <TopMenu />
        <MainContainer />
      </div>
    );
  }
}

export default App;
