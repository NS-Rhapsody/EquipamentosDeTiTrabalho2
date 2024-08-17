// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnwTv_XLwEwj83RmzppnEkMZLTlJe2fFM",
  authDomain: "ww-loja-de-equipamentos-4a925.firebaseapp.com",
  projectId: "ww-loja-de-equipamentos-4a925",
  storageBucket: "ww-loja-de-equipamentos-4a925.appspot.com",
  messagingSenderId: "624798480174",
  appId: "1:624798480174:web:81369ef022f4a030bc2cbf"
}

// Initialize Firebase
let firebaseApp
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApp()
    deleteApp(firebaseApp)
    firebaseApp = initializeApp(firebaseConfig)
}

export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)