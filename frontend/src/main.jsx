/** src/main.jsx
 ** Main control file, and highest level of the app. Allows for passing of dispatch commands to window in development mode.
 *! !!! WARNING: MASTER CONTROL COMPONENT! SHOULD NOT BE CHANGED UNLESS 100% NEEDED! !!!
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { Modal, ModalProvider } from './context/Modal';
import configureStore from './store';
import { restoreCSRF, csrfFetch } from './store/csrf';
import * as sessionActions from './store/session';
import './index.css';

// Create the Redux store.
const store = configureStore();

// When in development mods, allow the window to execute dispatch commands specified here.
if(import.meta.env.MODE !== 'production') {
  restoreCSRF();

  window.csrfFetch = csrfFetch;
  window.store = store;
  window.sessionActions = sessionActions;
}

// Render the React application.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ModalProvider>
      <Provider store={store}>
        <App />
        <Modal />
      </Provider>
    </ModalProvider>
  </React.StrictMode>
);
