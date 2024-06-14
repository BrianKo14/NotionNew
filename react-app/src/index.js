import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));


/* Mobile devices */
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

const MobileView = () => (
  <div><h1>For the best experience, please access this site from a desktop computer.</h1></div> );


/* RENDER */
root.render(
  <React.StrictMode>
    { isMobile ? <MobileView /> : <App /> }
  </React.StrictMode>
);