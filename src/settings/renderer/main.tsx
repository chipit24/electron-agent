import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { Settings } from "./settings";

createRoot(document.getElementById("settings") as HTMLElement).render(
  <StrictMode>
    <Settings />
  </StrictMode>
);
