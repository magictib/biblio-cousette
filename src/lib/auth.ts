import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const toEmail = (username: string) =>
  `${username.toLowerCase().trim()}@biblio-cousette.app`;

const validateUsername = (key: string) => {
  if (key.length < 3) throw new Error("L'identifiant doit faire au moins 3 caractères.");
  if (!/^[a-z0-9_.-]+$/.test(key))
    throw new Error('Identifiant invalide (lettres, chiffres, _, ., - uniquement).');
};

export async function signUp(username: string, password: string): Promise<User> {
  const key = username.toLowerCase().trim();
  validateUsername(key);

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

export async function changeUsername(
  user: User,
  currentUsername: string,
  currentPassword: string,
  newUsername: string,
): Promise<void> {
  const key = newUsername.toLowerCase().trim();
  validateUsername(key);

  // Vérifier disponibilité
  const existing = await getDoc(doc(db, 'usernames', key));
  if (existing.exists() && existing.data().uid !== user.uid)
    throw new Error('Cet identifiant est déjà pris.');

  // Réauthentification requise par Firebase pour modifier l'email
  const credential = EmailAuthProvider.credential(toEmail(currentUsername), currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Mettre à jour l'email Firebase Auth
  await updateEmail(user, toEmail(key));

  // Mettre à jour Firestore
  await Promise.all([
    deleteDoc(doc(db, 'usernames', currentUsername)),
    setDoc(doc(db, 'usernames', key), { uid: user.uid }),
    updateDoc(doc(db, 'users', user.uid), { username: key }),
  ]);
}

export async function changePassword(
  user: User,
  currentUsername: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 6)
    throw new Error('Le nouveau mot de passe doit faire au moins 6 caractères.');

  const credential = EmailAuthProvider.credential(toEmail(currentUsername), currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export { onAuthStateChanged, type User };
