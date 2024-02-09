import { initializeApp } from "firebase/app";
// ts-ignore
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Optionally import the services that you want to use
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDdLpV4nXjFf-Z62gCpNC9hqK6km6UB58s",
  authDomain: "bookworm-338ce.firebaseapp.com",
  projectId: "bookworm-338ce",
  storageBucket: "bookworm-338ce.appspot.com",
  messagingSenderId: "90311569106",
  appId: "1:90311569106:web:d8d7c2fe041e67beda470b",
  measurementId: "G-FBB1BW3BFM",
};

const FIREBASE = initializeApp(firebaseConfig);
initializeAuth(FIREBASE, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const FIREBASE_AUTH = getAuth(FIREBASE);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
