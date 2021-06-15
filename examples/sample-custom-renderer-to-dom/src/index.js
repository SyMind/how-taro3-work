import React from 'react';
// import ReactDOM from 'react-dom';
import ReactDOMMini from './ReactDOMMini';
import './index.css';
import App from './App';

ReactDOMMini.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
