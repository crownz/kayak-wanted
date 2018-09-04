import React, { Component } from 'react';
import Terminal from 'terminal-in-react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Terminal
          color="orange"
          prompt="orange"
          backgroundColor="black"
          barColor="black"
          allowTabs={false}
          hideTopBar
          style={{
            fontWeight: 'bold',
            fontSize: '1em',
            height: '100%',
            maxHeight: '100%'
          }}
          msg="You have been hacked. Enter your credit card details to ???!"
        />
      </div>
    );
  }
}

export default App;
