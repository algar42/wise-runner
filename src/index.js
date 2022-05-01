import React from "react";
import "./index.css";
import CssBaseline from "@mui/material/CssBaseline";
import * as serviceWorker from "./serviceWorker";
import store from "./app/store";
import { Provider } from "react-redux";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import App from "./App";

import { createRoot } from "react-dom/client";
const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(
  //<React.StrictMode>
  <Provider store={store}>
    <CssBaseline />
    <App />
  </Provider>
  //</React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
