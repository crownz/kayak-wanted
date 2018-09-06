import React, { Component } from 'react';
import Terminal from 'terminal-in-react';
import './App.css';

class App extends Component {
  showChallange = question => question;

  questionId = null;

  componentDidMount() {
    this.questionId = window.location.pathname.replace('/', '');
  }

  state = {
    loading: false
  };

  submitAnswer = answer => {
    return new Promise((resolve, reject) => {
      this.setState({ loading: true }, () =>
        fetch('/api/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify({ hash: this.questionId, answer })
        })
          .then(res => res.json())
          .then(res => {
            console.log('res:', res);
            this.setState({ loading: false });
            resolve('Correct!');
          })
          .catch(err => {
            console.log('error', err);
            this.setState({ loading: false });
            resolve(`${answer} is incorrect answer.`);
          })
      );
    });
  };

  render() {
    const { question } = this.props;
    const { loading } = this.state;
    console.log('question:', question);

    return (
      <div className="app">
        {loading && <div style={{ color: 'white' }}>loading...</div>}
        <Terminal
          color="orange"
          prompt="orange"
          backgroundColor="black"
          barColor="black"
          allowTabs={false}
          hideTopBar
          commands={{ show: false }}
          style={{
            fontWeight: 'bold',
            fontSize: '1em',
            height: '100%',
            maxHeight: '100%'
          }}
          commands={{
            challange: () => this.showChallange(question),
            answer: (userInput, print) => {
              // return ;
              this.submitAnswer(userInput[1]).then(res => {
                print(res);
              });
            }
          }}
          descriptions={{
            challange: 'show the challange',
            answer: 'submit your answer'
          }}
          msg={`Welcome to mysterious challange. <help>`}
        />
      </div>
    );
  }
}

export default App;
