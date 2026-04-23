"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, updateDoc, doc, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Scissors, Box, Camera, Users, Plus, CheckCircle2, Ruler, X, Leaf, Loader2, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION FIREBASE ---
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
const storage = getStorage(app);

export default function CoutureApp() {
  const [view, setView] = useState('inventory');
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    length: '', 
    width: '', 
    color: '', 
    type: 'fabric', 
    imageUrl: '' 
  });

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `fabrics/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData({ ...formData, imageUrl: url });
    } catch (error) {
      console.error("Erreur upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name === '') return;
    
    if (formData.type === 'fabric') {
      await addDoc(collection(db, "fabrics"), {
        name: formData.name,
        color: formData.color || "Non précisé",
        length: formData.length || "0",
        width: formData.width || "0",
        image: formData.imageUrl || ""
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
    setFormData({ name: '', length: '', width: '', color: '', type: 'fabric', imageUrl: '' });
  };

  const updateProjectStep = async (projectId: string, currentStepIndex: number) => {
    const nextStep = currentStepIndex + 1;
    if (nextStep < steps.length) {
      await updateDoc(doc(db, "projects", projectId), {
        currentStep: nextStep,
        progress: Math.round(((nextStep + 1) / steps.length) * 100)
      });
    }
  };

  return (
    <div className="min-h-screen relative bg-stone-50 text-stone-900 font-sans overflow-x-hidden">
      
      {/* IMAGE DE FOND FIXE */}
      <div 
        className="fixed inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "url('/fond-couture.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <div className="relative z-10 pb-24">
        <header className="bg-white/80 backdrop-blur-md p-6 sticky top-0 z-20 flex justify-between items-center border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-700 p-1.5 rounded-lg text-white">
                <Scissors size={18} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-emerald-900 uppercase">Biblio Cousette</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white p-2.5 rounded-full shadow-lg active:scale-90 transition border-2 border-white/50">
            <Plus size={20} />
          </button>
        </header>

        <main className="p-4 max-w-xl mx-auto">
          {view === 'inventory' && (
            <div className="grid grid-cols-2 gap-4">
              {fabrics.map(fabric => (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} key={fabric.id} className="bg-white/90 backdrop-blur-sm rounded-[1.5rem] border border-stone-200 overflow-hidden shadow-sm flex flex-col h-full">
                  <div className="h-44 bg-stone-100 flex items-center justify-center relative overflow-hidden group">
                    {fabric.image ? (
                        <img src={fabric.image} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt={fabric.name} />
                    ) : (
                        <div className="flex flex-col items-center opacity-20 italic">
                            <Box size={32} />
                            <span className="text-[8px] mt-2 font-bold uppercase tracking-widest">Pas de photo</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                        {fabric.color}
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <h3 className="font-black text-xs truncate uppercase text-stone-800 leading-tight mb-1">{fabric.name}</h3>
                    <p className="text-[10px] text-emerald-700 font-bold tracking-widest uppercase">
                        {fabric.length}m x {fabric.width}cm
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* VUE PROJETS */}
          {view === 'projects' && (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-stone-200 shadow-sm text-stone-900">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-lg text-stone-800 uppercase tracking-tighter">{project.name}</h3>
                      <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-widest">Étape: {steps[project.currentStep]}</p>
                    </div>
                    <span className="text-3xl font-black text-emerald-600 italic leading-none">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2.5 rounded-full mb-6 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-700" style={{width: `${project.progress}%`}}></div>
                  </div>
                  <button onClick={() => updateProjectStep(project.id, project.currentStep)} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition shadow-lg uppercase">
                    <CheckCircle2 size={16} /> Étape Suivante
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* VUE SCANNER IA */}
          {view === 'scan' && (
            <div className="space-y-6 text-center pt-4">
               <div className="relative aspect-[3/4] bg-stone-900 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl mx-4">
                <motion.div animate={{ y: [0, 480, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="h-1 w-full bg-emerald-400 shadow-[0_0_20px_emerald] z-10 opacity-70" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-500/20">
                  <Camera size={100} strokeWidth={0.5} />
                  <p className="text-[10px] uppercase tracking-[0.4em] mt-6 font-black">Scanner Optique</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Barre de navigation */}
        <nav className="fixed bottom-6 left-4 right-4 bg-white/80 backdrop-blur-xl border border-stone-200 h-20 rounded-full shadow-2xl flex justify-around items-center px-4 z-40">
          <button onClick={() => setView('inventory')} className={`p-3 rounded-2xl transition-all ${view === 'inventory' ? 'text-emerald-700 bg-emerald-50 scale-110 shadow-sm' : 'text-stone-400'}`}><Box size={24} /></button>
          <button onClick={() => setView('projects')} className={`p-3 rounded-2xl transition-all ${view === 'projects' ? 'text-emerald-700 bg-emerald-50 scale-110 shadow-sm' : 'text-stone-400'}`}><Scissors size={24} /></button>
          <button onClick={() => setView('scan')} className="bg-emerald-600 text-white p-5 rounded-full -mt-12 shadow-xl shadow-emerald-200 active:scale-90 transition border-4 border-white"><Camera size={28} /></button>
          <button onClick={() => setView('community')} className={`p-3 rounded-2xl transition-all ${view === 'community' ? 'text-emerald-700 bg-emerald-50 scale-110 shadow-sm' : 'text-stone-400'}`}><Users size={24} /></button>
          <button onClick={() => setView('patterns')} className={`p-3 rounded-2xl transition-all ${view === 'patterns' ? 'text-emerald-700 bg-emerald-50 scale-110 shadow-sm' : 'text-stone-400'}`}><Ruler size={24} /></button>
        </nav>

        {/* Modal d'ajout - TEXTE CORRIGÉ ICI */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
              <motion.div initial={{y:300}} animate={{y:0}} exit={{y:300}} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-stone-200">
                <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-stone-900">Ajouter</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 bg-stone-100 rounded-full text-stone-500"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex bg-stone-100 p-1 rounded-2xl mb-4 shadow-inner">
                     <button type="button" onClick={() => setFormData({...formData, type: 'fabric'})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'fabric' ? 'bg-white shadow-md text-emerald-700' : 'text-stone-500'}`}>Tissu</button>
                     <button type="button" onClick={() => setFormData({...formData, type: 'project'})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'project' ? 'bg-white shadow-md text-emerald-700' : 'text-stone-500'}`}>Projet</button>
                  </div>

                  {formData.type === 'fabric' && (
                    <>
                      <div className="relative h-40 w-full bg-stone-100 rounded-3xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center overflow-hidden mb-4 shadow-inner">
                        {uploading ? (
                             <Loader2 className="animate-spin text-emerald-600" />
                        ) : formData.imageUrl ? (
                          <img src={formData.imageUrl} className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Camera className="text-stone-400 mx-auto mb-2" size={32} />
                            <span className="text-[10px] uppercase font-black text-stone-400 tracking-tighter">Photo du tissu</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>

                      {/* CHAMP COULEUR : TEXTE NOIR FORCÉ */}
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                            <Palette size={16} />
                        </div>
                        <input 
                          placeholder="COULEUR (EX: BLEU CANARD)" 
                          className="w-full p-4 pl-12 bg-stone-100 rounded-2xl outline-none text-[12px] font-bold uppercase tracking-widest text-stone-900 placeholder:text-stone-400 focus:ring-2 ring-emerald-500 transition-all border border-stone-200" 
                          value={formData.color} 
                          onChange={e => setFormData({...formData, color: e.target.value})} 
                        />
                      </div>
                    </>
                  )}

                  {/* CHAMP NOM : TEXTE NOIR FORCÉ */}
                  <input 
                    required 
                    placeholder="NOM DE L'ÉLÉMENT" 
                    className="w-full p-4 bg-stone-100 rounded-2xl outline-none text-[12px] font-bold uppercase tracking-widest text-stone-900 placeholder:text-stone-400 focus:ring-2 ring-emerald-500 transition-all border border-stone-200" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                  
                  {formData.type === 'fabric' && (
                    <div className="flex gap-4">
                      <input 
                        placeholder="LONG. (M)" 
                        className="w-1/2 p-4 bg-stone-100 rounded-2xl outline-none text-[12px] font-bold tracking-widest text-stone-900 placeholder:text-stone-400 border border-stone-200" 
                        value={formData.length} 
                        onChange={e => setFormData({...formData, length: e.target.value})} 
                      />
                      <input 
                        placeholder="LAIZE (CM)" 
                        className="w-1/2 p-4 bg-stone-100 rounded-2xl outline-none text-[12px] font-bold tracking-widest text-stone-900 placeholder:text-stone-400 border border-stone-200" 
                        value={formData.width} 
                        onChange={e => setFormData({...formData, width: e.target.value})} 
                      />
                    </div>
                  )}
                  
                  <button type="submit" disabled={uploading} className="w-full py-5 bg-emerald-700 text-white rounded-[2rem] font-black mt-6 shadow-xl active:scale-95 transition tracking-[0.2em] text-xs uppercase disabled:bg-stone-300">
                    {uploading ? "CHARGEMENT..." : "ENREGISTRER"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}