import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

createRoot(document.getElementById("settings") || document.body).render(
  <StrictMode>
    <main>
      <h1>Settings</h1>
      <p>This is the settings modal.</p>
    </main>
  </StrictMode>
);
