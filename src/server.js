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
    answer: '1/8',
    question: 'I roll three dice, and multiply the three numbers together. What is the probability the total will be odd? (the answer should be formatted like: 1/80)',
    hint: 'To get an odd product, all three dice have to roll odd.',
    nextStateTip: 'Seek for a new QR code in the parking lot, on a white car.'
  },
  '0a94f03c-68d3-4058-96fc-c68bfe3325c2': {
    state: 2,
    answer: '28',
    question: 'In a room there are a mixture of people and dogs. There are 72 heads, and 200 legs. How many dogs are in the room?',
    nextStateTip: 'Find a blue car!'
  },
  'cdfbfcff-2c43-4612-ab4f-e7072ae50983': {
    state: 3,
    answer: '6',
    question: 'If 66 = 2, 999 = 3, 8=2, 0=1, 9696=4, 8123=2, 98=3 and 88=4, then what does 816982 equal?',
    hint: 'o',
    nextStateTip: 'Find a green car!'
  },
  '7d91890d-7bf2-42d2-bae1-8a4d034adbab': {
    state: 4,
    answer: '11',
    question: 'You’re taking care of a friend’s house whilst he’s on vacation. In one room you pull the chain on a ceiling fan, and when it doesn’t respond you realize the house has temporarily lost power. Doh! Unfortunately, you have to leave now, and you’ll be away for several days.\n\nYou know that the fan was in the “off” position before you pulled the chain, and that pulling the chain successively will cycle it through its remaining settings ("off", “high”, “medium”, etc.). You don’t know how many settings there are, but you are sure there aren’t more than four (including "off").\n\nHow many times more do you have to pull the chain to ensure that the fan will be in the “off” position when power is restored?',
    hint: 'Try finding a Lowest Common Multiple',
    nextStateTip: 'Find a orange car!'
  },
  '215d6520-040c-4099-8f32-dade1ebd390a': {
    state: 5,
    answer: '4',
    question: 'In a certain country 1/2 of 5 = 3. If the same proportion holds, what is the value of 1/3 of 10?',
    hint: 'It looks like a proportion',
    nextStateTip: 'Congratulation, You have completed the mysterious challenge. Find KAYAK\'s booth to redeem your prize!'
  }
};

const generateId = () => uuidv4();

app.post('/api/answer', (req, res) => {
  console.log('payload:', req.body);
  const payload = req.body;
  const questionHash = payload.hash;
  const playerId = req.cookies.playerId;
  console.log('cookies', req.cookies);
  if (!playerId || !questionHash) {
    res.status(500).end('YOU DO NOT BELONG HERE!');
    return;
  }

  const question = questions[questionHash];

  console.log('correct answer is:', question.answer);
  console.log('user guessed:', payload.answer);
  console.log('is correct?', question.answer === payload.answer);

  if (question && question.answer === payload.answer) {
    peopleState[playerId]++;
    res.status(200).send({ tip: question.nextStateTip, question: `The challenge has been completed. Seek for a new riddle: ${question.nextStateTip}`, state: peopleState[playerId] });
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

  console.log('have id stored?', playerId, peopleState[playerId]);
  if (playerId && peopleState[playerId]) {
    state = peopleState[playerId];
  } else {
    playerId = generateId();
    peopleState[playerId] = 1;
  }

  const initialState = {
    isQuestionAnswered: false,
    state
  };

  const currentQuestion = questions[questionsHash];

  // Redirect to previous question url, if question hash in the url is incorrect.
  if (!currentQuestion) {
    if (state === 6) {
      res.redirect('/215d6520-040c-4099-8f32-dade1ebd390a');
    }

    const currentHash = Object.keys(questions).find(key => {
      return questions[key].state + 1 === state;
    });

    if (currentHash) {
      res.redirect(`/${currentHash}`);
    } else {
      console.log('failed to find the current hash.');
      res.redirect('/ffa90155-b7f9-46bb-ae48-5c51c4b93c93');
    }
    return;
  }

  console.log('people state', peopleState);

  if (currentQuestion.state === state) {
    // cool, return current question.
    initialState.nextStepTip = currentQuestion.hint;
    initialState.question = currentQuestion.question;
  } else if (currentQuestion.state + 1 === state) {
    // user already answered this, give tip to next state.
    initialState.nextStepTip = currentQuestion.nextStateTip;
    initialState.question = `The challenge has been completed. Find and scan the next QR code: ${currentQuestion.nextStateTip}`
    initialState.isQuestionAnswered = true;
  } else if (state === 1) {
    // initialState.nextStepTip = 'To start the challenge, look for QR code at the entrance.';
    initialState.question = 'To start the mysterious challenge, look for a QR code at the entrance.';
    initialState.isQuestionAnswered = true;
  } else {
    const currentHash = Object.keys(questions).find(key => {
      return questions[key].state + 1 === state;
    });
    res.redirect(`/${currentHash}`);
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
      <title>Mysterious Challenge</title>
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
