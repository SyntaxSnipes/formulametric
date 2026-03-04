import ReactDOM from "react-dom/client";
import Home from "./App.jsx";
import "./styles/index.css"; //importing base styles for the app
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter future={{ v7_startTransition: true }}>
    <Home />
  </BrowserRouter>,
);
