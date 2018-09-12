import React, { Component } from 'react';
import Terminal from 'terminal-in-react';
import './App.css';

const initialQuestion = 'The question is answered. Seek for a new challange!';
const initialTip = 'We do not have any tips at the moment.';

class App extends Component {

  questionId = null;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      question: props.question || initialQuestion,
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
        return resolve('There are no challanges to answer.');
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
            this.setState({ loading: false, nextStepTip: res.tip, question: initialQuestion, isQuestionAnswered: true });
            resolve(`Correct! ${res.tip}`);
          })
          .catch(err => {
            console.log('error', err);
            this.setState({ loading: false });
            resolve(`${answer} is incorrect answer.`);
          })
      );
    });
  };

  getNextStepTip = () => this.state.nextStepTip;
  getCurrentQuestion = () => this.state.question;

  render() {
    const { loading, question, nextStepTip } = this.state;
    console.log('state updated!', this.state);

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
            challange: () => this.getCurrentQuestion(),
            tip: () => this.getNextStepTip(),
            answer: (userInput, print) => {
              this.submitAnswer(userInput[1]).then(res => {
                print(res);
              });
            }
          }}
          descriptions={{
            challange: 'Show the challange',
            answer: 'Submit your answer',
            tip: 'What should I do next?'
          }}
          msg={'Welcome to mysterious challange. <help>'}
        />
      </div>
    );
  }
}

export default App;
