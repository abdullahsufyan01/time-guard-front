import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Centralized Firebase initialization that won't double-initialize if App.jsx already did
const firebaseConfig = {
  apiKey: "AIzaSyB1vRlCYw3tvvs32Wx4KtSLomv_xUNNgIk",
  authDomain: "keos-40c69.firebaseapp.com",
  projectId: "keos-40c69",
  storageBucket: "keos-40c69.appspot.com",
  messagingSenderId: "347190337353",
  appId: "1:347190337353:web:cdddd84db921e732834498",
  measurementId: "G-R40YBPRPNT"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;


