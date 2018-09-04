import React from 'react';
import Terminal from 'terminal-in-react';

import './Home.css';

const Home = () => {
  return (
    <div className="home">
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
        commands={{
          showmsg: this.showMsg
        }}
        descriptions={{
          showmsg: 'shows a message'
        }}
        msg="You have been hacked. Enter your credit card details to survive."
      />
    </div>
  );
};

export default Home;
