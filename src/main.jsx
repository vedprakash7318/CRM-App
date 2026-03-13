import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./Redux/Store.js";

import { onMessage } from "firebase/messaging";
import { messaging } from "./Features/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🔔 FOREGROUND NOTIFICATION
onMessage(messaging, (payload) => {
  const title = payload.notification?.title || "New Notification";
  const body = payload.notification?.body || "";

  // 🔊 SOUND
  const audio = new Audio("/ring1.mp3");
  audio.play().catch(() => {});

  toast(
    <>
      <strong>{title}</strong>
      <div>{body}</div>
    </>
  );
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <ToastContainer />
    </Provider>
  </StrictMode>
);
