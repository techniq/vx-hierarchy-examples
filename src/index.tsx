import React from 'react';
import ReactDOM from 'react-dom';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
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
    <CssBaseline />
    <App />
  </ThemeProvider>,
  rootElement
);
