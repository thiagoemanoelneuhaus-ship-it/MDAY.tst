import React from "react";
import { createRoot } from "react-dom/client";
import "@vibe/core/tokens";
import "./styles.css";
import { WorkBoard } from "./work-board.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WorkBoard />
  </React.StrictMode>,
);
