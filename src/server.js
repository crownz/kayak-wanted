import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

import manifest from '../build/asset-manifest.json';

import App from './App';

const app = express();
const port = process.env.PORT || 5000;

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.use('/statics', express.static('build'));

app.get('/', function(req, res) {
  const jsBundle = manifest['main.js'];
  const cssBundle = manifest['main.css'];
  const content = renderToString(<App />);
  console.log('Serving from node!');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlTemplate(content, jsBundle, cssBundle));
});

app.listen(port, () => console.log(`Listening on port ${port}`));

function htmlTemplate(content, jsBundle, cssBundle) {
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
      <script src="/statics/${jsBundle}"></script>
    </body>
    
    </html>
    `;
}
