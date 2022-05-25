import React from 'react';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);

reportWebVitals();