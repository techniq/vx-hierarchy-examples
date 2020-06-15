import React from 'react';
import ReactDOM from 'react-dom';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { blue, orange } from '@material-ui/core/colors';

import App from './App';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: orange,
  },
});

const rootElement = document.getElementById('root');
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  rootElement
);
