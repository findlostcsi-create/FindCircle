import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCYT_qMsaWmca7cKupNoeHEVJPY4IIKDGs',
  authDomain: 'findnlost-faadd.firebaseapp.com',
  projectId: 'findnlost-faadd',
  storageBucket: 'findnlost-faadd.firebasestorage.app',
  messagingSenderId: '1096860678713',
  appId: '1:1096860678713:web:4ef6679d447daee9dd2be8',
  measurementId: 'G-LBCXBC5VLT'
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
