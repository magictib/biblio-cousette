"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, updateDoc, doc, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Scissors, Box, Camera, Users, Plus, CheckCircle2, Ruler, X, Leaf, Loader2 } from 'lucide-react';
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
  const [formData, setFormData] = useState({ name: '', length: '', width: '', type: 'fabric', imageUrl: '' });

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
        length: formData.length || "0",
        width: formData.width || "0",
        image: formData.imageUrl || "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=400"
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
    setFormData({ name: '', length: '', width: '', type: 'fabric', imageUrl: '' });
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
          filter: 'grayscale(20%)'
        }}
      ></div>

      <div className="relative z-10 pb-24">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md p-6 sticky top-0 z-20 flex justify-between items-center border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                <Scissors size={18} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-emerald-900 uppercase">Biblio Cousette</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white p-2.5 rounded-full shadow-lg active:scale-90 transition">
            <Plus size={20} />
          </button>
        </header>

        <main className="p-4 max-w-xl mx-auto">
          {/* VUE TISSUTHÈQUE */}
          {view === 'inventory' && (
            <div className="grid grid-cols-2 gap-4">
              {fabrics.map(fabric => (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={fabric.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                  <div className="h-40 bg-stone-200 bg-cover bg-center" style={{backgroundImage: `url(${fabric.image})`}}></div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm truncate uppercase tracking-tight">{fabric.name}</h3>
                    <p className="text-xs text-emerald-700 font-bold tracking-widest">{fabric.length}m x {fabric.width}cm</p>
                  </div>
                </motion.div>
              ))}
              {fabrics.length === 0 && <p className="col-span-2 text-center text-stone-500 mt-20 italic">Aucun tissu dans votre collection.</p>}
            </div>
          )}

          {/* VUE PROJETS */}
          {view === 'projects' && (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-lg text-stone-800 uppercase tracking-tighter">{project.name}</h3>
                      <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-widest">Étape: {steps[project.currentStep]}</p>
                    </div>
                    <span className="text-3xl font-black text-emerald-600 italic">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full mb-6 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-700" style={{width: `${project.progress}%`}}></div>
                  </div>
                  <button onClick={() => updateProjectStep(project.id, project.currentStep)} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition">
                    <CheckCircle2 size={16} /> VALIDER L'ÉTAPE SUIVANTE
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* VUE SCANNER */}
          {view === 'scan' && (
            <div className="space-y-6 text-center">
               <div className="relative aspect-[3/4] bg-stone-900 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
                <motion.div animate={{ y: [0, 450, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="h-1 w-full bg-emerald-400 shadow-[0_0_20px_emerald] z-10 opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-500/30">
                  <Camera size={80} strokeWidth={1} />
                  <p className="text-[10px] uppercase tracking-[0.3em] mt-4 font-bold">Scanner Optique IA</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-stone-200 shadow-sm px-10 text-stone-600">
                <h2 className="font-bold text-stone-900 mb-2 uppercase tracking-tighter">Calcul de surface</h2>
                <p className="text-xs leading-relaxed italic">Posez votre coupon à plat avec un objet de référence pour calculer le métrage exact.</p>
              </div>
            </div>
          )}
        </main>

        {/* Barre de navigation */}
        <nav className="fixed bottom-6 left-4 right-4 bg-white/80 backdrop-blur-xl border border-stone-200 h-20 rounded-full shadow-2xl flex justify-around items-center px-4 z-40">
          <button onClick={() => setView('inventory')} className={`p-3 rounded-2xl transition-all ${view === 'inventory' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400'}`}><Box size={24} /></button>
          <button onClick={() => setView('projects')} className={`p-3 rounded-2xl transition-all ${view === 'projects' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400'}`}><Scissors size={24} /></button>
          <button onClick={() => setView('scan')} className="bg-emerald-600 text-white p-5 rounded-full -mt-12 shadow-xl shadow-emerald-200 active:scale-90 transition border-4 border-white"><Camera size={28} /></button>
          <button onClick={() => setView('community')} className={`p-3 rounded-2xl transition-all ${view === 'community' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400'}`}><Users size={24} /></button>
          <button onClick={() => setView('patterns')} className={`p-3 rounded-2xl transition-all ${view === 'patterns' ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400'}`}><Ruler size={24} /></button>
        </nav>

        {/* Modal d'ajout */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
              <motion.div initial={{y:200}} animate={{y:0}} exit={{y:200}} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-stone-800">Ajouter</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 bg-stone-100 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex bg-stone-100 p-1 rounded-2xl mb-4">
                     <button type="button" onClick={() => setFormData({...formData, type: 'fabric'})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${formData.type === 'fabric' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500'}`}>Tissu</button>
                     <button type="button" onClick={() => setFormData({...formData, type: 'project'})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${formData.type === 'project' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-500'}`}>Projet</button>
                  </div>

                  {formData.type === 'fabric' && (
                    <div className="relative h-40 w-full bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center overflow-hidden mb-4 group active:bg-stone-100 transition">
                      {uploading ? (
                        <Loader2 className="animate-spin text-emerald-600" />
                      ) : formData.imageUrl ? (
                        <img src={formData.imageUrl} className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera className="text-stone-300 mx-auto mb-2" size={32} />
                          <span className="text-[10px] uppercase font-black text-stone-400 tracking-tighter">Photo du tissu</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}

                  <input required placeholder="NOM DE L'ÉLÉMENT" className="w-full p-4 bg-stone-100 rounded-2xl outline-none text-xs font-bold uppercase tracking-widest placeholder:text-stone-300" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  
                  {formData.type === 'fabric' && (
                    <div className="flex gap-4">
                      <input placeholder="LONG. (M)" className="w-1/2 p-4 bg-stone-100 rounded-2xl outline-none text-xs font-bold tracking-widest" value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} />
                      <input placeholder="LAIZE (CM)" className="w-1/2 p-4 bg-stone-100 rounded-2xl outline-none text-xs font-bold tracking-widest" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} />
                    </div>
                  )}
                  
                  <button type="submit" disabled={uploading} className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black mt-6 shadow-xl active:scale-95 transition tracking-[0.2em] text-xs uppercase disabled:bg-stone-300">
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