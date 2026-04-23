"use client";
import React, { useState, useEffect } from 'react';
// IMPORTATIONS DIRECTES
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, updateDoc, doc, orderBy } from "firebase/firestore";
import { Scissors, Box, Camera, Users, Plus, CheckCircle2, Ruler, X, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION FIREBASE DIRECTE ---
const firebaseConfig = {
  apiKey: "AIzaSyBEVM0fe2Euf3vELdGKiM43UNxENW6Dkjc",
  authDomain: "biblio-cousette.firebaseapp.com",
  databaseURL: "https://biblio-cousette-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "biblio-cousette",
  storageBucket: "biblio-cousette.firebasestorage.app",
  messagingSenderId: "330590240229",
  appId: "1:330590240229:web:356021cf2d08556c95c30c"
};

// Initialisation
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// --- CODE DE L'APPLICATION ---
export default function CoutureApp() {
  const [view, setView] = useState('inventory');
  const [fabrics, setFabrics] = useState([]);
  const [projects, setProjects] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name === '') return;
    if (formData.type === 'fabric') {
      await addDoc(collection(db, "fabrics"), {
        name: formData.name,
        length: formData.length || "0",
        width: formData.width || "0",
        image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=400"
      });
    } else {
      await addDoc(collection(db, "projects"), {
        name: formData.name,
        patternName: "Patron Standard",
        currentStep: 0,
        progress: 0
      });
    }
    setShowModal(false);
    setFormData({ name: '', length: '', width: '', type: 'fabric' });
  };

  const updateProjectStep = async (projectId, currentStepIndex) => {
    const nextStep = currentStepIndex + 1;
    if (nextStep < steps.length) {
      await updateDoc(doc(db, "projects", projectId), {
        currentStep: nextStep,
        progress: Math.round(((nextStep + 1) / steps.length) * 100)
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 text-stone-900">
      <header className="bg-white/80 backdrop-blur-md p-6 sticky top-0 z-20 flex justify-between items-center border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Leaf className="text-emerald-600" size={24} />
          <h1 className="text-xl font-bold tracking-tight uppercase text-emerald-800">Biblio Cousette</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white p-2 rounded-full shadow-lg">
          <Plus size={20} />
        </button>
      </header>

      <main className="p-4 max-w-xl mx-auto">
        {view === 'inventory' && (
          <div className="grid grid-cols-2 gap-4">
            {fabrics.map(fabric => (
              <div key={fabric.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="h-32 bg-stone-200 bg-cover bg-center" style={{backgroundImage: `url(${fabric.image})`}}></div>
                <div className="p-3">
                  <h3 className="font-bold text-sm truncate">{fabric.name}</h3>
                  <p className="text-xs text-stone-500 font-medium">{fabric.length}m x {fabric.width}cm</p>
                </div>
              </div>
            ))}
            {fabrics.length === 0 && <p className="col-span-2 text-center text-stone-400 mt-10">Aucun tissu dans la collection.</p>}
          </div>
        )}

        {view === 'projects' && (
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    <p className="text-xs text-stone-400 uppercase font-bold">Étape: {steps[project.currentStep]}</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full mb-6 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-700" style={{width: `${project.progress}%`}}></div>
                </div>
                <button onClick={() => updateProjectStep(project.id, project.currentStep)} className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> ÉTAPE SUIVANTE
                </button>
              </div>
            ))}
          </div>
        )}

        {view === 'scan' && (
          <div className="space-y-6">
            <div className="relative aspect-[3/4] bg-stone-900 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500">
                <Camera size={48} className="mb-4 opacity-20" />
                <p className="text-xs uppercase">Analyse de surface...</p>
              </div>
              <motion.div animate={{ y: [0, 400, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="h-1 w-full bg-emerald-400 shadow-[0_0_20px_emerald] z-10 opacity-50" />
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center">
              <h2 className="font-bold text-emerald-900 mb-2 italic">Calculateur de coupe intelligent</h2>
              <p className="text-sm text-emerald-700 leading-relaxed">Placez votre tissu et votre patron sera disposé automatiquement pour optimiser la place.</p>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-4 right-4 bg-white border border-stone-200 h-20 rounded-full shadow-2xl flex justify-around items-center px-4 z-40">
        <button onClick={() => setView('inventory')} className={`p-3 rounded-2xl ${view === 'inventory' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400'}`}><Box size={24} /></button>
        <button onClick={() => setView('projects')} className={`p-3 rounded-2xl ${view === 'projects' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400'}`}><Scissors size={24} /></button>
        <button onClick={() => setView('scan')} className="bg-emerald-600 text-white p-5 rounded-full -mt-12 shadow-xl shadow-emerald-200"><Camera size={28} /></button>
        <button onClick={() => setView('community')} className={`p-3 rounded-2xl ${view === 'community' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400'}`}><Users size={24} /></button>
        <button onClick={() => setView('patterns')} className={`p-3 rounded-2xl ${view === 'patterns' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400'}`}><Ruler size={24} /></button>
      </nav>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{y:100}} animate={{y:0}} exit={{y:100}} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Ajouter</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-stone-100 rounded-full"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex bg-stone-100 p-1 rounded-2xl">
                   <button type="button" onClick={() => setFormData({...formData, type: 'fabric'})} className={`flex-1 py-2 rounded-xl text-sm font-bold ${formData.type === 'fabric' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500'}`}>TISSU</button>
                   <button type="button" onClick={() => setFormData({...formData, type: 'project'})} className={`flex-1 py-2 rounded-xl text-sm font-bold ${formData.type === 'project' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500'}`}>PROJET</button>
                </div>
                <input required placeholder="Nom (ex: Soie sauvage, Robe Luna...)" className="w-full p-4 bg-stone-100 rounded-2xl outline-none focus:ring-2 ring-emerald-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                {formData.type === 'fabric' && (
                  <div className="flex gap-4">
                    <input placeholder="Longueur (m)" className="w-1/2 p-4 bg-stone-100 rounded-2xl outline-none" value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} />
                    <input placeholder="Laize (cm)" className="w-1/2 p-4 bg-stone-100 rounded-2xl outline-none" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} />
                  </div>
                )}
                <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold mt-4 shadow-lg active:scale-95 transition">ENREGISTRER</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}