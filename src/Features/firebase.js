import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBBYo1Zgim-Z-snKUFLQwe9vjblqRXCbNA",
  authDomain: "crmadmin-d988f.firebaseapp.com",
  projectId: "crmadmin-d988f",
  messagingSenderId: "380846726921",
  appId: "1:380846726921:web:9002bf1e3fadc900aebdd8",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
