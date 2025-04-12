import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create a more robust mounting method with error handling
const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("React app successfully mounted");
  } catch (error) {
    console.error("Failed to render the application:", error);
    // Show a fallback error message
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center;">
        <h1 style="color: #D22B2B; margin-bottom: 20px;">Application Error</h1>
        <p>We're sorry, but the application could not be loaded properly.</p>
        <p>Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    `;
  }
} else {
  console.error("Could not find root element to mount React application");
}
