import React, { Component } from 'react';
import Terminal from 'terminal-in-react';
import './App.css';

const initialTip = 'Sorry, there are no tips at this moment.';

class App extends Component {

  questionId = null;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      question: props.question,
      nextStepTip: props.nextStepTip || initialTip,
      isQuestionAnswered: props.isQuestionAnswered,
      progress: props.state
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
          credentials: 'include',
          body: JSON.stringify({ hash: this.questionId, answer })
        })
          .then(res => res.json())
          .then(res => {
            this.setState({ loading: false, nextStepTip: res.tip, question: res.question, isQuestionAnswered: true, progress: res.state });
            resolve(`Correct! ${res.tip}`);
          })
          .catch(err => {
            this.setState({ loading: false });
            resolve(`${answer} is incorrect. Try again or seek for a tip.`);
          })
      );
    });
  };

  getNextStepTip = () => this.state.nextStepTip;
  getCurrentQuestion = () => this.state.question;

  render() {
    const { loading, progress } = this.state;
    const progressPercent = (progress - 1) * 20;

    return (
      <div className="app">
        <div className="progress">
          <div className="progressInner">
            <div className="bar" style={{ width: `${progressPercent || 1}%`}}>
              //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////            
            </div>
          </div>
        </div>
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
            answer: (userInput, print) => {
              this.submitAnswer(userInput[1]).then(res => {
                print(res);
              });
            },
            tip: () => this.getNextStepTip(),
          }}
          descriptions={{
            show: 'Show the initial message.',
            clear: 'Clear the screen.',
            challenge: '* Show the current challenge *',
            answer: 'Type "answer <your answer>" to complete the challenge.',
            tip: 'Are there any tips?'
          }}
          msg={'Welcome to the mysterious challenge. There will be 5 steps you have to pass in order to win a prize. You can track your progress in the bar above. Type "help" to get the instructions. Commands are case sensitive!'}
        />
      </div>
    );
  }
}

export default App;
