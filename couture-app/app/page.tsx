"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, updateDoc, doc, orderBy } from "firebase/firestore";
import { Scissors, Box, Camera, Users, Plus, CheckCircle2, Ruler, X, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const firebaseConfig = {
  apiKey: "AIzaSyBEVM0fe2Euf3vELdGKiM43UNxENW6Dkjc",
  authDomain: "biblio-cousette.firebaseapp.com",
  databaseURL: "https://biblio-cousette-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "biblio-cousette",
  storageBucket: "biblio-cousette.firebasestorage.app",
  messagingSenderId: "330590240229",
  appId: "1:330590240229:web:356021cf2d08556c95c30c"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function CoutureApp() {
  const [view, setView] = useState('inventory');
  
  // ICI LES DEUX LIGNES CORRIGÉES :
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', length: '', width: '', type: 'fabric' });

  const steps = ["Achat", "Lavage", "Découpe", "Broderie", "Assemblage", "Couture", "Finitions"];

  useEffect(() => {
    try {
      const qF = query(collection(db, "fabrics"), orderBy("name"));
      const qP = query(collection(db, "projects"));
      const unsubF = onSnapshot(qF, (snap) => setFabrics(snap.docs.map(d => ({id: d.id, ...d.data()}))));
      const unsubP = onSnapshot(qP, (snap) => setProjects(snap.docs.map(d => ({id: d.id, ...d.data()}))));
      return () => { unsubF(); unsubP(); };
    } catch (e) { console.error("Erreur Firebase:", e); }
  }, []);

  // ... le reste de ton code ne change pas