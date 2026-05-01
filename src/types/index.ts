export interface Fabric {
  id: string;
  name: string;
  color: string;
  width: number;           // largeur de laize en cm (ex: 140)
  length: number;          // métrage en mètres (ex: 2.5)
  type: string;
  pattern?: string;
  notes?: string;
  photos: string[];        // base64 data URLs (compressées)
  isScrap: boolean;        // chute de tissu
  estimatedArea?: number;  // surface estimée en cm² (pour les chutes)
}

export interface PatternFile {
  name: string;
  dataUrl: string;
}

export interface Pattern {
  id: string;
  name: string;
  designer?: string;
  clothingType: string;
  width: number;
  height: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  notes?: string;
  pdfDataUrl?: string;          // legacy — migré vers pdfFiles au chargement
  pdfFiles?: PatternFile[];     // plusieurs fichiers (patron, livrets, etc.)
  primaryPdfIndex?: number;     // index du fichier affiché par défaut
}

export interface Project {
  id: string;
  name: string;
  fabricId: string;
  patternId: string;
  status: 'planning' | 'brodage' | 'decoupe' | 'couture' | 'finition' | 'complete';
  photos: string[];
  notes?: string;
  createdAt: string;
}

export interface Creation {
  id: string;
  name: string;
  status: 'en_cours' | 'termine';
  photos: string[];
  fabricName?: string;
  fabricId?: string;
  patternName?: string;
  patternId?: string;
  tips?: string;
  difficulties?: string;
  notes?: string;
  startedAt: string;
  finishedAt?: string;
}

export interface FittingResult {
  canFit: boolean;
  rotations: {
    horizontal: boolean;
    vertical: boolean;
  };
  position?: {
    x: number;
    y: number;
  };
}
