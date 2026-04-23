import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (configuredApiBaseUrl) {
  setBaseUrl(configuredApiBaseUrl);
} else if (import.meta.env.DEV) {
  setBaseUrl("http://localhost:3000");
}

createRoot(document.getElementById("root")!).render(<App />);
