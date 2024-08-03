// main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import Store from './redux/Store.jsx'; // Import the configured store
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={Store}> {/* Wrap your app with the Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
