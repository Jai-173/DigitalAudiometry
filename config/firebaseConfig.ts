import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDzRuIUJwjMOd_T2iyk2oEIOonGyH3JZUU",
  authDomain: "auralis-ab1ae.firebaseapp.com",
  projectId: "auralis-ab1ae",
  storageBucket: "auralis-ab1ae.firebasestorage.app",
  messagingSenderId: "675119506562",
  appId: "1:675119506562:web:cd39fd9335dc5f2326009b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };