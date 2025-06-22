import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./app";

const root = createRoot(document.body);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
