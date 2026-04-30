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

export interface Pattern {
  id: string;
  name: string;
  designer?: string;       // nom de la créatrice
  clothingType: string;
  width: number;           // en cm
  height: number;          // en cm
  difficulty: 'facile' | 'moyen' | 'difficile';
  notes?: string;
  pdfDataUrl?: string;     // PDF ou image importé(e), stocké(e) en base64
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
