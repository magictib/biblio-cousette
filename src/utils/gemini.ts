'use client';

const MODEL = 'gemini-1.5-flash';
const BASE   = 'https://generativelanguage.googleapis.com/v1beta/models';

export function getGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('gemini_api_key') ?? '';
}

export function setGeminiKey(key: string) {
  localStorage.setItem('gemini_api_key', key.trim());
}

async function callGemini(apiKey: string, parts: unknown[], maxTokens = 2048): Promise<string> {
  const url = `${BASE}/${MODEL}:generateContent?key=${apiKey}`;
  const res  = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.1, maxOutputTokens: maxTokens },
    }),
  });
  const data = await res.json() as {
    candidates?: { content: { parts: { text: string }[] } }[];
    error?: { message: string };
  };
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function dataUrlParts(dataUrl: string) {
  const m = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  return { mimeType: m?.[1] ?? 'image/jpeg', data: m?.[2] ?? dataUrl };
}

/* ── Détection couleur ───────────────────────────────────────── */
export async function detectColorFromImage(
  imageDataUrl: string
): Promise<{ hex: string; name: string }> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('Clé Gemini non configurée');

  const { mimeType, data } = dataUrlParts(imageDataUrl);
  const prompt = `Analyse cette photo de tissu et identifie sa couleur dominante.
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown :
{"hex": "#RRGGBB", "name": "couleur en français"}`;

  const text = await callGemini(apiKey, [
    { inlineData: { mimeType, data } },
    { text: prompt },
  ], 100);

  const m = text.match(/\{[\s\S]*?\}/);
  if (!m) throw new Error('Réponse invalide');
  const r = JSON.parse(m[0]) as { hex?: string; name?: string };
  if (!r.hex?.match(/^#[0-9A-Fa-f]{6}$/)) throw new Error('Couleur invalide');
  return { hex: r.hex, name: r.name ?? '' };
}

/* ── Estimation surface chute ────────────────────────────────── */
export async function estimateScrapArea(
  imageDataUrl: string
): Promise<{ area_cm2: number; confidence: string; note: string }> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('Clé Gemini non configurée');

  const { mimeType, data } = dataUrlParts(imageDataUrl);
  const prompt = `Estime la surface en cm² de la chute de tissu visible. Tissu posé à plat.
Réponds UNIQUEMENT JSON : {"area_cm2": 1200, "confidence": "moyen", "note": "explication courte"}`;

  const text = await callGemini(apiKey, [
    { inlineData: { mimeType, data } },
    { text: prompt },
  ], 200);

  const m = text.match(/\{[\s\S]*?\}/);
  if (!m) throw new Error('Réponse invalide');
  return JSON.parse(m[0]) as { area_cm2: number; confidence: string; note: string };
}

/* ── Analyse patron PDF / image ──────────────────────────────── */
const SIZES: Record<string, [number, number, number]> = {
  '34': [82,64,90], '36': [86,68,94], '38': [90,72,98],
  '40': [94,76,102],'42': [98,80,106],'44': [102,84,110],
  '46': [106,88,114],'48': [110,92,118],'50': [114,96,122],
};
function sz(size: string, m: 'bust'|'waist'|'hip') {
  const r = SIZES[size];
  if (!r) return m === 'bust' ? 90 : m === 'waist' ? 72 : 98;
  return m === 'bust' ? r[0] : m === 'waist' ? r[1] : r[2];
}

export async function analyzePattern(
  fileDataUrl: string,
  size: string
): Promise<{ garment_type: string; pieces: PatternPieceRaw[] }> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('Clé Gemini non configurée');

  const { mimeType, data } = dataUrlParts(fileDataUrl);

  const prompt = [
    `Tu es une experte en couture. ${mimeType === 'application/pdf' ? 'Ce PDF contient un patron.' : 'Cette image contient un patron.'}`,
    size ? `Taille souhaitée : ${size}.` : 'Utilise la taille médiane.',
    `Référence taille ${size||'médiane'} : poitrine ${sz(size,'bust')} cm, taille ${sz(size,'waist')} cm, hanches ${sz(size,'hip')} cm.`,
    `Liste CHAQUE pièce individuellement ("Manche droite", "Manche gauche", etc.).`,
    `Pour chaque pièce : name, width_cm, height_cm, area_cm2 (surface réelle), quantity (=1), on_fold, shape (rectangle|trapeze|triangle|curved|irregular), notes.`,
    `IMPORTANT : si le patron n'est pas visible, estime des dimensions typiques.`,
    `Réponds UNIQUEMENT JSON sans markdown :`,
    `{"garment_type":"robe","pieces":[{"name":"Devant","width_cm":48,"height_cm":62,"area_cm2":2400,"quantity":1,"on_fold":true,"shape":"trapeze","notes":""}]}`,
  ].join(' ');

  const text = await callGemini(apiKey, [
    { inlineData: { mimeType, data } },
    { text: prompt },
  ], 4096);

  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`Réponse non analysable : ${text.slice(0, 200)}`);
  const parsed = JSON.parse(m[0]) as { garment_type?: string; pieces?: PatternPieceRaw[] };
  return { garment_type: parsed.garment_type ?? 'autres', pieces: parsed.pieces ?? [] };
}

export interface PatternPieceRaw {
  name: string;
  width_cm: number;
  height_cm: number;
  area_cm2?: number;
  quantity: number;
  on_fold: boolean;
  shape?: string;
  notes?: string;
}
