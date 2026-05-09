import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyA3zTUa8Whw5X_jEJzqBTkQIPWWq84koHY",
  authDomain: "nangangeatjoycook.firebaseapp.com",
  projectId: "nangangeatjoycook",
  storageBucket: "nangangeatjoycook.firebasestorage.app",
  messagingSenderId: "976247626913",
  appId: "1:976247626913:web:103bdd5c5c2fcc9a48e4e0",
  measurementId: "G-JYWNHMJV0T"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const analytics = getAnalytics(app)

// 路徑 helper（與現有系統相容）
const APP_ID = "nangangeatjoycook"
export const getPublicPath = (col) => `artifacts/${APP_ID}/public/data/${col}`
