import React, { Component } from 'react';
import Terminal from 'terminal-in-react';
import './App.css';

// const initialQuestion = 'The question is answered. Seek for a new challenge!';
const initialTip = 'We do not have any tips at the moment.';

class App extends Component {

  questionId = null;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      question: props.question,
      nextStepTip: props.nextStepTip || initialTip,
      isQuestionAnswered: props.isQuestionAnswered
    };
  }

  componentDidMount() {
    this.questionId = window.location.pathname.replace('/', '');
  }

  submitAnswer = answer => {
    return new Promise((resolve, reject) => {
      if (this.state.isQuestionAnswered) {
        return resolve(this.state.question);
      }

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
            this.setState({ loading: false, nextStepTip: res.tip, question: res.question, isQuestionAnswered: true });
            resolve(`Correct! ${res.tip}`);
          })
          .catch(err => {
            this.setState({ loading: false });
            resolve(`${answer} is incorrect answer.`);
          })
      );
    });
  };

  getNextStepTip = () => this.state.nextStepTip;
  getCurrentQuestion = () => this.state.question;

  render() {
    const { loading } = this.state;

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
            challenge: () => this.getCurrentQuestion(),
            tip: () => this.getNextStepTip(),
            answer: (userInput, print) => {
              this.submitAnswer(userInput[1]).then(res => {
                print(res);
              });
            }
          }}
          descriptions={{
            show: 'Show the initial message.',
            clear: 'Clear the screen.',
            challenge: 'Show current challenge.',
            answer: 'Type "answer <your answer>" to complete the challenge.',
            tip: 'Are there any tips?'
          }}
          msg={'Welcome to a mysterious challenge. Try to solve me! Type "help"'}
        />
      </div>
    );
  }
}

export default App;
