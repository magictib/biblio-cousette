'use client';

import { Fabric, Pattern } from '@/types';
import { migrateFabric, migratePattern } from './migrate';

const DB_NAME = 'biblio-cousette';
const DB_VER  = 2; // v2 : ajout du store 'binaries'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('fabrics'))  db.createObjectStore('fabrics',  { keyPath: 'id' });
      if (!db.objectStoreNames.contains('patterns')) db.createObjectStore('patterns', { keyPath: 'id' });
      // Store générique pour les binaires (PDFs, photos) indexés par clé string
      if (!db.objectStoreNames.contains('binaries')) db.createObjectStore('binaries', { keyPath: 'key' });
    };
    req.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror   = e => reject((e.target as IDBOpenDBRequest).error);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = e => resolve((e.target as IDBRequest<T[]>).result);
    req.onerror   = e => reject((e.target as IDBRequest).error);
  });
}

async function putAll(storeName: string, items: { id: string }[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    for (const item of items) store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror    = e => reject((e.target as IDBTransaction).error);
  });
}

// ── Store binaires (PDFs, photos) ────────────────────────────────

export async function saveBinaryIDB(key: string, data: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('binaries', 'readwrite');
    tx.objectStore('binaries').put({ key, data });
    tx.oncomplete = () => resolve();
    tx.onerror    = e => reject((e.target as IDBTransaction).error);
  });
}

export async function loadBinaryIDB<T>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('binaries', 'readonly');
    const req = tx.objectStore('binaries').get(key);
    req.onsuccess = e => {
      const result = (e.target as IDBRequest<{ key: string; data: T } | undefined>).result;
      resolve(result?.data ?? null);
    };
    req.onerror = e => reject((e.target as IDBRequest).error);
  });
}

// ── Fabrics / Patterns (migration depuis localStorage) ───────────

export async function loadFabricsIDB(): Promise<Fabric[]> {
  try {
    const raw = await getAll<unknown>('fabrics');
    return raw.map(migrateFabric);
  } catch { return []; }
}

export async function saveFabricsIDB(fabrics: Fabric[]): Promise<void> {
  await putAll('fabrics', fabrics as { id: string }[]);
}

export async function loadPatternsIDB(): Promise<Pattern[]> {
  try {
    const raw = await getAll<unknown>('patterns');
    return raw.map(migratePattern);
  } catch { return []; }
}

export async function savePatternsIDB(patterns: Pattern[]): Promise<void> {
  await putAll('patterns', patterns as { id: string }[]);
}
