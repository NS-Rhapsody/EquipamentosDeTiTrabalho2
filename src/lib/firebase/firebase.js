// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4zmQR5hACqtJLxd5XE48ThkH2pidmdcs",
  authDomain: "loja-de-equipamentos-ti2.firebaseapp.com",
  projectId: "loja-de-equipamentos-ti2",
  storageBucket: "loja-de-equipamentos-ti2.appspot.com",
  messagingSenderId: "567917373825",
  appId: "1:567917373825:web:78a7e11e3a2f52ab2ea080",
  measurementId: "G-Z2FE1SBKFE"
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
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp)
