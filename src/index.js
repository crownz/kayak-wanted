import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { unregister } from './registerServiceWorker';

const props = window.__INITIAL_DATA__ || {
    question: 'What is 2 + 2?'
};

ReactDOM.hydrate(<App {...props} />, document.getElementById('root'));
unregister();
