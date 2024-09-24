// main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import Store from './redux/Store.jsx'; // Import the configured store
import App from './App.jsx';
import './index.css';
import { SocketProvider } from './context/SocketContext.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <SocketProvider>
    <Provider store={Store}> {/* Wrap your app with the Provider */}
      <App />
      <Toaster />
    </Provider>
  </SocketProvider>
);
