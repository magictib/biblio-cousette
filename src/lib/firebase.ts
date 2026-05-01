import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBEVM0fe2Euf3vELdGKiM43UNxENW6Dkjc',
  authDomain: 'biblio-cousette.firebaseapp.com',
  projectId: 'biblio-cousette',
  storageBucket: 'biblio-cousette.firebasestorage.app',
  messagingSenderId: '330590240229',
  appId: '1:330590240229:web:356021cf2d08556c95c30c',
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
