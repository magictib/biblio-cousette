import {
  collection, doc, getDocs, setDoc, deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Fabric, Pattern, Project, Creation } from '@/types';

// Upload un dataUrl (base64) vers Firebase Storage et retourne l'URL publique.
// Si la valeur est déjà une URL https://, on la renvoie telle quelle.
async function uploadIfNeeded(path: string, value: string): Promise<string> {
  if (!value || !value.startsWith('data:')) return value;
  const [header, b64] = value.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: mime });
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

// ── TISSUS ───────────────────────────────────────────────────────

export async function loadFabricsDB(uid: string): Promise<Fabric[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'fabrics'));
  return snap.docs.map(d => d.data() as Fabric);
}

export async function saveFabricDB(uid: string, fabric: Fabric): Promise<Fabric> {
  const photos = await Promise.all(
    fabric.photos.map((p, i) =>
      uploadIfNeeded(`users/${uid}/fabrics/${fabric.id}/p${i}`, p),
    ),
  );
  const toSave: Fabric = { ...fabric, photos };
  await setDoc(doc(db, 'users', uid, 'fabrics', fabric.id), toSave);
  return toSave;
}

export async function deleteFabricDB(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'fabrics', id));
}

// ── PATRONS ──────────────────────────────────────────────────────

export async function loadPatternsDB(uid: string): Promise<Pattern[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'patterns'));
  return snap.docs.map(d => d.data() as Pattern);
}

export async function savePatternDB(uid: string, pattern: Pattern): Promise<Pattern> {
  const pdfFiles = await Promise.all(
    (pattern.pdfFiles ?? []).map(async (f, i) => ({
      name: f.name,
      dataUrl: await uploadIfNeeded(
        `users/${uid}/patterns/${pattern.id}/f${i}`,
        f.dataUrl,
      ),
    })),
  );
  // Supprimer le champ legacy avant de sauvegarder
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pdfDataUrl: _legacy, ...rest } = pattern;
  const toSave: Pattern = { ...rest, pdfFiles };
  await setDoc(doc(db, 'users', uid, 'patterns', pattern.id), toSave);
  return toSave;
}

export async function deletePatternDB(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'patterns', id));
}

// ── PROJETS ──────────────────────────────────────────────────────

export async function loadProjectsDB(uid: string): Promise<Project[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'projects'));
  return snap.docs.map(d => d.data() as Project);
}

export async function saveProjectDB(uid: string, project: Project): Promise<Project> {
  const photos = await Promise.all(
    project.photos.map((p, i) =>
      uploadIfNeeded(`users/${uid}/projects/${project.id}/p${i}`, p),
    ),
  );
  const toSave: Project = { ...project, photos };
  await setDoc(doc(db, 'users', uid, 'projects', project.id), toSave);
  return toSave;
}

export async function deleteProjectDB(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'projects', id));
}

// ── PARTAGE (section commune à tous les profils) ──────────────────

export type SharedCreation = Creation & { userId: string; username: string };

export async function loadSharedCreationsDB(): Promise<SharedCreation[]> {
  const snap = await getDocs(collection(db, 'shared_creations'));
  return snap.docs
    .map(d => d.data() as SharedCreation)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function saveSharedCreationDB(
  uid: string,
  username: string,
  creation: Creation,
): Promise<SharedCreation> {
  const photos = await Promise.all(
    creation.photos.map((p, i) =>
      uploadIfNeeded(`shared/${creation.id}/p${i}`, p),
    ),
  );
  const toSave: SharedCreation = { ...creation, photos, userId: uid, username };
  await setDoc(doc(db, 'shared_creations', creation.id), toSave);
  return toSave;
}

export async function deleteSharedCreationDB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'shared_creations', id));
}
