importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBBYo1Zgim-Z-snKUFLQwe9vjblqRXCbNA",
  messagingSenderId: "380846726921",
  appId: "1:380846726921:web:9002bf1e3fadc900aebdd8",
  projectId: "crmadmin-d988f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: "/favicon.ico",
    sound: "default",
    requireInteraction: true,
  };

  self.registration.showNotification(title, options);
});
