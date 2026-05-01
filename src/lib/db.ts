import {
  collection, doc, getDocs, setDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { saveBinaryIDB, loadBinaryIDB } from '@/utils/idb';
import { Fabric, Pattern, PatternFile, Project, Creation } from '@/types';

// ─────────────────────────────────────────────────────────────────
// Architecture hybride :
//   • Métadonnées (noms, dimensions, types…) → Firestore (cloud, rapide)
//   • Binaires (PDFs, photos en base64)       → IndexedDB (local, instantané)
// Les PDFs et photos ne quittent pas le navigateur — pas besoin de Storage.
// ─────────────────────────────────────────────────────────────────

// ── TISSUS ───────────────────────────────────────────────────────

type FabricMeta = Omit<Fabric, 'photos'> & { photoCount: number };

export async function loadFabricsDB(uid: string): Promise<Fabric[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'fabrics'));
  const metas = snap.docs.map(d => d.data() as FabricMeta);

  return Promise.all(metas.map(async meta => {
    const photos = await loadBinaryIDB<string[]>(`fabric_photos_${meta.id}`);
    return { ...meta, photos: photos ?? [] } as Fabric;
  }));
}

export async function saveFabricDB(uid: string, fabric: Fabric): Promise<Fabric> {
  // Photos → IndexedDB
  await saveBinaryIDB(`fabric_photos_${fabric.id}`, fabric.photos);

  // Métadonnées sans les photos → Firestore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { photos: _photos, ...rest } = fabric;
  const meta: FabricMeta = { ...rest, photoCount: fabric.photos.length };
  await setDoc(doc(db, 'users', uid, 'fabrics', fabric.id), meta);

  return fabric;
}

export async function deleteFabricDB(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'fabrics', id));
  // Les photos IDB restent (pas critique, petites clés)
}

// ── PATRONS ──────────────────────────────────────────────────────

type PdfFileMeta = { name: string };
type PatternMeta = Omit<Pattern, 'pdfFiles' | 'pdfDataUrl'> & { pdfFileNames: PdfFileMeta[] };

export async function loadPatternsDB(uid: string): Promise<Pattern[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'patterns'));
  const metas = snap.docs.map(d => d.data() as PatternMeta);

  return Promise.all(metas.map(async meta => {
    const pdfFiles = await loadBinaryIDB<PatternFile[]>(`pattern_pdfs_${meta.id}`);
    const { pdfFileNames: _names, ...rest } = meta;
    return { ...rest, pdfFiles: pdfFiles ?? [] } as Pattern;
  }));
}

export async function savePatternDB(uid: string, pattern: Pattern): Promise<Pattern> {
  // PDFs complets → IndexedDB
  await saveBinaryIDB(`pattern_pdfs_${pattern.id}`, pattern.pdfFiles ?? []);

  // Métadonnées sans les dataUrls → Firestore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pdfFiles, pdfDataUrl: _legacy, ...rest } = pattern;
  const meta: PatternMeta = {
    ...rest,
    pdfFileNames: (pdfFiles ?? []).map(f => ({ name: f.name })),
  };
  await setDoc(doc(db, 'users', uid, 'patterns', pattern.id), meta);

  return pattern;
}

export async function deletePatternDB(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'patterns', id));
}

// ── PROJETS ──────────────────────────────────────────────────────

type ProjectMeta = Omit<Project, 'photos'> & { photoCount: number };

export async function loadProjectsDB(uid: string): Promise<Project[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'projects'));
  const metas = snap.docs.map(d => d.data() as ProjectMeta);

  return Promise.all(metas.map(async meta => {
    const photos = await loadBinaryIDB<string[]>(`project_photos_${meta.id}`);
    return { ...meta, photos: photos ?? [] } as Project;
  }));
}

export async function saveProjectDB(uid: string, project: Project): Promise<Project> {
  await saveBinaryIDB(`project_photos_${project.id}`, project.photos);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { photos: _photos, ...rest } = project;
  const meta: ProjectMeta = { ...rest, photoCount: project.photos.length };
  await setDoc(doc(db, 'users', uid, 'projects', project.id), meta);
  return project;
}

export async function deleteProjectDB(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'projects', id));
}

// ── PARTAGE (commun à tous les profils) ──────────────────────────

export type SharedCreation = Creation & { userId: string; username: string };

type SharedCreationMeta = Omit<SharedCreation, 'photos'> & { photoCount: number };

export async function loadSharedCreationsDB(): Promise<SharedCreation[]> {
  const snap = await getDocs(collection(db, 'shared_creations'));
  const metas = snap.docs.map(d => d.data() as SharedCreationMeta);

  const items = await Promise.all(metas.map(async meta => {
    const photos = await loadBinaryIDB<string[]>(`shared_photos_${meta.id}`);
    return { ...meta, photos: photos ?? [] } as SharedCreation;
  }));

  return items.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function saveSharedCreationDB(
  uid: string,
  username: string,
  creation: Creation,
): Promise<SharedCreation> {
  await saveBinaryIDB(`shared_photos_${creation.id}`, creation.photos);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { photos: _photos, ...rest } = creation;
  const meta: SharedCreationMeta = { ...rest, photoCount: creation.photos.length, userId: uid, username };
  await setDoc(doc(db, 'shared_creations', creation.id), meta);
  return { ...creation, userId: uid, username };
}

export async function deleteSharedCreationDB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'shared_creations', id));
}
