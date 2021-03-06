import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import 'fontsource-roboto'
import { createMuiTheme, ThemeProvider } from '@material-ui/core'
import CssBaseline from '@material-ui/core/CssBaseline'
import { BrowserRouter } from 'react-router-dom'
import green from '@material-ui/core/colors/green'
import deepOrange from '@material-ui/core/colors/deepOrange'

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: green[600],
    },
    secondary: {
      main: deepOrange[600],
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
