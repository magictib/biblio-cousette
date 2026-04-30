import { Fabric, Pattern } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateFabric(raw: any): Fabric {
  return {
    id:            String(raw.id ?? ''),
    name:          String(raw.name ?? ''),
    color:         String(raw.color ?? '#C4889A'),
    type:          String(raw.type ?? 'coton'),
    // Ancien format stockait height en cm — on convertit en mètres
    width:         Number(raw.width ?? 140),
    length:        raw.length !== undefined
                     ? Number(raw.length)
                     : raw.height !== undefined
                       ? +(Number(raw.height) / 100).toFixed(2)
                       : 1,
    pattern:       raw.pattern ? String(raw.pattern) : undefined,
    notes:         raw.notes   ? String(raw.notes)   : undefined,
    photos:        Array.isArray(raw.photos) ? raw.photos : [],
    isScrap:       Boolean(raw.isScrap ?? false),
    estimatedArea: raw.estimatedArea !== undefined ? Number(raw.estimatedArea) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migratePattern(raw: any): Pattern {
  return {
    id:          String(raw.id ?? ''),
    name:        String(raw.name ?? ''),
    designer:    raw.designer ? String(raw.designer) : undefined,
    clothingType:String(raw.clothingType ?? 'autres'),
    width:       Number(raw.width ?? 60),
    height:      Number(raw.height ?? 80),
    difficulty:  (['facile', 'moyen', 'difficile'].includes(raw.difficulty) ? raw.difficulty : 'moyen') as Pattern['difficulty'],
    notes:       raw.notes ? String(raw.notes) : undefined,
  };
}

export function loadFabrics(): Fabric[] {
  try {
    const raw = localStorage.getItem('fabrics');
    if (!raw) return [];
    return (JSON.parse(raw) as unknown[]).map(migrateFabric);
  } catch {
    return [];
  }
}

export function loadPatterns(): Pattern[] {
  try {
    const raw = localStorage.getItem('patterns');
    if (!raw) return [];
    return (JSON.parse(raw) as unknown[]).map(migratePattern);
  } catch {
    return [];
  }
}
