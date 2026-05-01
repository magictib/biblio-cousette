'use client';

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

export function getOpenAIKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('openai_api_key') ?? '';
}

export function setOpenAIKey(key: string) {
  localStorage.setItem('openai_api_key', key.trim());
}

export interface AnalyzeParams {
  imageDataUrl?: string;
  fabricWidthCm: number;
  fabricLengthM: number;
  size: string;
  version?: string;
  garmentSubtype?: string;
  stretchDirection?: string;
}

function buildPrompt(p: AnalyzeParams): string {
  return [
    'Tu es une experte en couture, spécialisée dans les patrons Cousette (marque française de lingerie et loungewear).',
    '',
    'Paramètres du projet :',
    `- Largeur tissu (laize) : ${p.fabricWidthCm} cm`,
    `- Longueur tissu disponible : ${p.fabricLengthM.toFixed(2)} m`,
    `- Taille : ${p.size}`,
    p.version        ? `- Version du patron : ${p.version}` : null,
    p.garmentSubtype ? `- Type de vêtement : ${p.garmentSubtype}` : null,
    p.stretchDirection ? `- Extensibilité du tissu : ${p.stretchDirection}` : null,
    '',
    p.imageDataUrl
      ? "Un extrait du patron est joint en image. Analyse précisément les pièces à découper pour les paramètres ci-dessus."
      : "En te basant sur les paramètres et ta connaissance des patrons Cousette, liste toutes les pièces à découper.",
    '',
    'Pour chaque pièce, fournis EXACTEMENT ces champs :',
    '- name : nom précis en français (ex : "Devant", "Dos", "Bretelle droite", "Élastique taille")',
    '- width_cm : largeur de la boîte englobante en cm',
    '- height_cm : hauteur de la boîte englobante en cm',
    '- area_cm2 : surface réelle estimée en cm² (sans marges de couture)',
    '- quantity : 1 (liste chaque exemplaire séparément)',
    '- on_fold : true si la pièce est coupée sur tissu plié (donne la moitié)',
    '- shape : "rectangle" | "trapeze" | "triangle" | "curved" | "irregular"',
    '- notes : remarques utiles (sens du droit fil, entoilage, symétrie…)',
    '',
    'Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni backticks :',
    '{"garment_type":"culotte","pieces":[{"name":"Devant","width_cm":24,"height_cm":18,"area_cm2":320,"quantity":1,"on_fold":true,"shape":"curved","notes":"droit fil vertical"}]}',
  ].filter(l => l !== null).join('\n');
}

export async function analyzePatternGPT(
  params: AnalyzeParams,
): Promise<{ garment_type: string; pieces: PatternPieceRaw[] }> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('Clé OpenAI non configurée. Renseignez-la dans le panneau d\'analyse.');

  const prompt = buildPrompt(params);

  type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail: string } };

  let content: string | ContentBlock[];
  if (params.imageDataUrl) {
    const mime = params.imageDataUrl.match(/^data:([^;]+);/)?.[1] ?? '';
    if (mime.startsWith('image/')) {
      content = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: params.imageDataUrl, detail: 'high' } },
      ];
    } else {
      // PDF ou autre format non supporté en vision → analyse textuelle uniquement
      content = prompt;
    }
  } else {
    content = prompt;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content }],
      max_tokens: 4096,
      temperature: 0.1,
    }),
  });

  const data = await res.json() as {
    choices?: { message: { content: string } }[];
    error?: { message: string };
  };

  if (!res.ok || data.error) throw new Error(data.error?.message ?? `HTTP ${res.status}`);

  const text = data.choices?.[0]?.message?.content ?? '';
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`Réponse non analysable : ${text.slice(0, 200)}`);

  const parsed = JSON.parse(m[0]) as { garment_type?: string; pieces?: PatternPieceRaw[] };
  return {
    garment_type: parsed.garment_type ?? 'autres',
    pieces: parsed.pieces ?? [],
  };
}
