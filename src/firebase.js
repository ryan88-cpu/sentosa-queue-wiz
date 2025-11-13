// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBo1lX6_fuwcxoZSEUPVavjOIHhTX1pW-0",
  authDomain: "sentosa-queue-wiz.firebaseapp.com",
  projectId: "sentosa-queue-wiz",
  storageBucket: "sentosa-queue-wiz.firebasestorage.app",
  messagingSenderId: "194041940890",
  appId: "1:194041940890:web:d19c24a304f2ffb4ad0823",
  measurementId: "G-M5ZXVMVLYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);