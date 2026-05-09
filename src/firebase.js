// Firebase v8 compat — 與現有程式碼完全相容
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

const firebaseConfig = {
  apiKey: "AIzaSyA3zTUa8Whw5X_jEJzqBTkQIPWWq84koHY",
  authDomain: "nangangeatjoycook.firebaseapp.com",
  projectId: "nangangeatjoycook",
  storageBucket: "nangangeatjoycook.firebasestorage.app",
  messagingSenderId: "976247626913",
  appId: "1:976247626913:web:103bdd5c5c2fcc9a48e4e0",
  measurementId: "G-JYWNHMJV0T"
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export const db = firebase.firestore()
export const auth = firebase.auth()
export const getPublicPath = (col) => `artifacts/nangangeatjoycook/public/data/${col}`
