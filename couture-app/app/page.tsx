"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, updateDoc, doc, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Scissors, Box, Camera, Users, Plus, CheckCircle2, Ruler, X, Leaf, Loader2, Palette } from 'lucide-react';
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
const storage = getStorage(app);

export default function CoutureApp() {
  const [view, setView] = useState('inventory');
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', length: '', width: '', color: '', type: 'fabric', imageUrl: '' });

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
    } catch (error) { console.error("Erreur upload:", error); } finally { setUploading(false); }
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
    if (nextStep < 7) {
      await updateDoc(doc(db, "projects", projectId), {
        currentStep: nextStep,
        progress: Math.round(((nextStep + 1) / 7) * 100)
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden">
      
      {/* IMAGE DE FOND - Test avec opacité plus forte (40%) */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "url('/fond-couture.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <div className="relative z-10 pb-24">
        <header className="bg-white/90 p-6 sticky top-0 z-20 flex justify-between items-center border-b shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-700 p-1 rounded text-white"><Scissors size={20} /></div>
            <h1 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Biblio Cousette</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white p-2 rounded-full shadow-lg"><Plus size={24} /></button>
        </header>

        <main className="p-4 max-w-xl mx-auto">
          {view === 'inventory' && (
            <div className="grid grid-cols-2 gap-4">
              {fabrics.map(fabric => (
                <div key={fabric.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-md">
                  <div className="h-40 bg-stone-100 relative">
                    {fabric.image ? <img src={fabric.image} className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-stone-300 uppercase text-[10px]">No Photo</div>}
                    <div className="absolute top-2 right-2 bg-black text-white text-[8px] px-2 py-1 rounded-full font-bold uppercase">{fabric.color}</div>
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-bold text-xs uppercase text-black truncate">{fabric.name}</h3>
                    <p className="text-[10px] text-emerald-700 font-bold tracking-widest">{fabric.length}m x {fabric.width}cm</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'projects' && (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="bg-white p-6 rounded-3xl border shadow-lg text-black">
                  <h3 className="font-black text-lg uppercase mb-2">{project.name}</h3>
                  <div className="w-full bg-stone-200 h-2 rounded-full mb-4 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{width: `${project.progress}%`}}></div>
                  </div>
                  <button onClick={() => updateProjectStep(project.id, project.currentStep)} className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs uppercase">Étape Suivante</button>
                </div>
              ))}
            </div>
          )}
        </main>

        <nav className="fixed bottom-6 left-4 right-4 bg-white border h-20 rounded-full shadow-2xl flex justify-around items-center px-4 z-40">
          <button onClick={() => setView('inventory')} className={view === 'inventory' ? 'text-emerald-700' : 'text-stone-400'}><Box size={24} /></button>
          <button onClick={() => setView('projects')} className={view === 'projects' ? 'text-emerald-700' : 'text-stone-400'}><Scissors size={24} /></button>
          <button onClick={() => setView('scan')} className="bg-emerald-600 text-white p-4 rounded-full -mt-10 shadow-xl"><Camera size={28} /></button>
          <button onClick={() => setView('community')} className={view === 'community' ? 'text-emerald-700' : 'text-stone-400'}><Users size={24} /></button>
          <button onClick={() => setView('patterns')} className={view === 'patterns' ? 'text-emerald-700' : 'text-stone-400'}><Ruler size={24} /></button>
        </nav>

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-black uppercase">Ajouter</h2>
                  <button onClick={() => setShowModal(false)} className="text-stone-400"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input 
                    required 
                    style={{ color: 'black', backgroundColor: 'white' }}
                    className="w-full p-4 border border-stone-300 rounded-2xl outline-none text-sm font-bold uppercase tracking-widest" 
                    placeholder="NOM DE L'ÉLÉMENT" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />

                  {formData.type === 'fabric' && (
                    <>
                      <input 
                        style={{ color: 'black', backgroundColor: 'white' }}
                        className="w-full p-4 border border-stone-300 rounded-2xl outline-none text-sm font-bold uppercase tracking-widest" 
                        placeholder="COULEUR (EX: ROUGE)" 
                        value={formData.color} 
                        onChange={e => setFormData({...formData, color: e.target.value})} 
                      />
                      <div className="flex gap-2">
                        <input style={{ color: 'black', backgroundColor: 'white' }} className="w-1/2 p-4 border border-stone-300 rounded-2xl outline-none text-sm font-bold uppercase tracking-widest" placeholder="LONG. (M)" value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} />
                        <input style={{ color: 'black', backgroundColor: 'white' }} className="w-1/2 p-4 border border-stone-300 rounded-2xl outline-none text-sm font-bold uppercase tracking-widest" placeholder="LAIZE (CM)" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} />
                      </div>
                      <div className="relative h-24 bg-stone-100 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden">
                        {uploading ? <Loader2 className="animate-spin" /> : formData.imageUrl ? <img src={formData.imageUrl} className="h-full w-full object-cover" /> : <span className="text-[10px] font-bold text-stone-400">AJOUTER PHOTO</span>}
                        <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="absolute inset-0 opacity-0" />
                      </div>
                    </>
                  )}
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase shadow-lg">Enregistrer</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}