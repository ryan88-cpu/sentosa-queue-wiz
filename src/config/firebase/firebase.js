// src/config/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB0xIl6wFuwcXzSEUPVavjoJHTHxILpV-0",
  authDomain: "sentosa-queue-wiz.firebaseapp.com",
  projectId: "sentosa-queue-wiz",
  storageBucket: "sentosa-queue-wiz.appspot.com",
  messagingSenderId: "194049140980",
  appId: "1:194049140980:web:d19c24a3042ff4bfbad823",
  measurementId: "G-MS7XWVLNYJ",
  databaseURL: "https://sentosa-queue-wiz-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the database instance
export const db = getDatabase(app);