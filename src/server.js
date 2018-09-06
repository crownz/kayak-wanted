import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import React from 'react';
import { renderToString } from 'react-dom/server';

import manifest from '../build/asset-manifest.json';

import App from './App';

const app = express();
app.use(cookieParser());
app.use(bodyParser());
const port = process.env.PORT || 5000;

const peopleState = {
  asd312dadsa: 1
};

const questions = {
  1: {
    state: 1,
    answer: '4',
    question: 'What is 2 + 2?',
    tip: '',
    nextStateTip: ''
  },
  2: {},
  3: {},
  4: {},
  5: {}
};

const generateId = () => '1231231321dsd';

app.post('/api/answer', (req, res) => {
  console.log('payload:', req.body);
  const payload = req.body;
  const questionHash = payload.hash;
  const playerId = req.cookies.playerId;
  if (!playerId || !questionHash) {
    res.status(500).end('YOU DO NOT BELONG HERE!');
    return;
  }

  const question = questions[questionHash];

  if (question && question.answer === payload.answer) {
    res.status(200).send({ tip: question.nextStateTip });
    return;
  }

  res.status(400).end('The answer is incorrect');
});

app.use('/statics', express.static('build'));

app.get('/:id', function(req, res) {
  console.log('Serving from node!');
  const questionsHash = req.params.id;
  let playerId = req.cookies && req.cookies.playerId;
  let state = 1;
  const initialState = {};

  if (playerId && peopleState[playerId]) {
    state = peopleState[playerId];
  } else {
    playerId = generateId();
    peopleState[playerId] = 1;
  }

  console.log('people state', peopleState);

  const currentQuestion = questions[questionsHash];

  if (!currentQuestion) {
    // return error, wrong url.
    res.status(500).send('YOU DO NOT BELONG HERE!');
    return;
  }

  if (currentQuestion.state === state) {
    // cool, return current question.
    initialState.question = currentQuestion.question;
  } else if (currentQuestion.state + 1 === state) {
    // user already answered this, give tip to next state.
    initialState.nextStepTip = 'Next step is under a tree';
  } else {
    // accesing wrong state, error.
    res.status(500).send('YOU DO NOT BELONG HERE!');
    return;
  }

  const jsBundle = manifest['main.js'];
  const cssBundle = manifest['main.css'];
  const content = renderToString(<App {...initialState} />);
  res.cookie('playerId', playerId);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlTemplate(content, jsBundle, cssBundle, initialState));
});

app.listen(port, () => console.log(`Listening on port ${port}`));

function htmlTemplate(content, jsBundle, cssBundle, initialState) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title>HACKS.</title>
      <link href="/statics/${cssBundle}" rel="stylesheet">
    </head>
    
    <body>
      <div id="root">${content}</div>
      <script>window.__INITIAL_DATA__ = ${JSON.stringify(initialState)}</script>
      <script src="/statics/${jsBundle}"></script>
    </body>
    
    </html>
    `;
}
