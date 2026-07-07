// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LumafoldApp from "@/components/LumafoldApp";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App>
      <LumafoldApp />
    </App>
  </React.StrictMode>
);
