import { initializeApp } from "@react-native-firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCsVAeKDYkCO-vfFbmOB80PkvRmItNrAo8",
  authDomain: "smartspeak-dev-db.firebaseapp.com",
  databaseURL: "https://smartspeak-dev-db.firebaseio.com",
  projectId: "smartspeak-dev-db",
  storageBucket: "smartspeak-dev-db.appspot.com",
  messagingSenderId: "smartspeak",
  appId: "smartspeak",
  measurementId: "G-measurement-id",
};

const app = initializeApp(firebaseConfig);
