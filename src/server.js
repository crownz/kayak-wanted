import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import React from 'react';
import { renderToString } from 'react-dom/server';
import uuidv4 from 'uuid/v4';


import manifest from '../build/asset-manifest.json';

import App from './App';

const app = express();
app.use(cookieParser());
app.use(bodyParser());
const port = process.env.PORT || 5000;

const peopleState = {}; // userid: number

const questions = {
  'ffa90155-b7f9-46bb-ae48-5c51c4b93c93': {
    state: 1,
    answer: '4',
    question: 'What is 2 + 2?',
    tip: 'MATHS!',
    nextStateTip: 'Find a white car!'
  },
  '0a94f03c-68d3-4058-96fc-c68bfe3325c2': {
    state: 2,
    answer: '6',
    question: 'What is 3 + 3?',
    tip: 'MATHS!',
    nextStateTip: 'Find a blue car!'
  },
  'cdfbfcff-2c43-4612-ab4f-e7072ae50983': {},
  '7d91890d-7bf2-42d2-bae1-8a4d034adbab': {},
  '215d6520-040c-4099-8f32-dade1ebd390a': {}
};

const generateId = () => uuidv4();

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
    peopleState[playerId]++;
    res.status(200).send({ tip: question.nextStateTip });
    return;
  }

  res.status(400).end('The answer is incorrect');
});

app.use('/statics', express.static('build'));

app.get('/:id', function(req, res) {
  console.log('Serving from node!');
  const questionsHash = req.params.id;

  const currentQuestion = questions[questionsHash];

  if (!currentQuestion) {
    // return error, wrong url.
    res.status(500).send('YOU DO NOT BELONG HERE!');
    return;
  }

  let playerId = req.cookies && req.cookies.playerId;
  let state = 1;
  const initialState = {
    isQuestionAnswered: false
  };

  console.log('have id stored?', playerId, peopleState[playerId]);
  if (playerId && peopleState[playerId]) {
    state = peopleState[playerId];
  } else {
    playerId = generateId();
    peopleState[playerId] = 1;
  }

  console.log('people state', peopleState);

  if (currentQuestion.state === state) {
    // cool, return current question.
    initialState.question = currentQuestion.question;
  } else if (currentQuestion.state + 1 === state) {
    // user already answered this, give tip to next state.
    initialState.nextStepTip = currentQuestion.nextStateTip;
    initialState.isQuestionAnswered = true;
  } else if (state === 1) {
    initialState.nextStepTip = 'To start the challange, look for QR code at the entrance.';
    initialState.question = 'To start the challange, look for QR code at the entrance.';
    initialState.isQuestionAnswered = true;
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
