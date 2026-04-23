export interface Fabric {
  id: string;
  name: string;
  color: string;
  width: number; // en cm
  height: number; // en cm
  quantity: number;
  type: string; // coton, lin, jersey, etc.
  pattern?: string; // motif du tissu
  notes?: string;
}

export interface Pattern {
  id: string;
  name: string;
  clothingType: string; // robe, t-shirt, pantalon, etc.
  width: number; // en cm
  height: number; // en cm
  difficulty: 'facile' | 'moyen' | 'difficile';
  notes?: string;
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
