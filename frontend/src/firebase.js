// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCtSXP6zeXp_HmvEYX9xs4vZLec_orS4U4",
  authDomain: "resident-management-syst-b06cb.firebaseapp.com",
  databaseURL: "https://resident-management-syst-b06cb-default-rtdb.firebaseio.com",
  projectId: "resident-management-syst-b06cb",
  storageBucket: "resident-management-syst-b06cb.firebasestorage.app",
  messagingSenderId: "191069102873",
  appId: "1:191069102873:web:39810b90dbc5053e615b88",
  measurementId: "G-WFMMDP6XL7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rdb = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, rdb, storage };
