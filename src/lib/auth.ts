import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Pas d'email visible : on fabrique un email interne
const toEmail = (username: string) =>
  `${username.toLowerCase().trim()}@biblio-cousette.app`;

export async function signUp(username: string, password: string): Promise<User> {
  const key = username.toLowerCase().trim();
  if (key.length < 3) throw new Error("L'identifiant doit faire au moins 3 caractères.");
  if (!/^[a-z0-9_.:-]+$/.test(key))
    throw new Error('Identifiant invalide (lettres, chiffres, _, ., - uniquement).');

  const existing = await getDoc(doc(db, 'usernames', key));
  if (existing.exists()) throw new Error('Cet identifiant est déjà pris.');

  const { user } = await createUserWithEmailAndPassword(auth, toEmail(key), password);
  await Promise.all([
    setDoc(doc(db, 'usernames', key), { uid: user.uid }),
    setDoc(doc(db, 'users', user.uid), {
      username: key,
      createdAt: new Date().toISOString(),
    }),
  ]);
  return user;
}

export async function signIn(username: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(
    auth,
    toEmail(username.toLowerCase().trim()),
    password,
  );
  return user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export async function getUsername(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as { username: string }).username : null;
}

export { onAuthStateChanged, type User };
