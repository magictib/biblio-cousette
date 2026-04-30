import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY non configurée — ajoutez-la dans .env.local' },
      { status: 500 }
    );
  }

  const { fileDataUrl, size } = await request.json() as { fileDataUrl: string; size: string };
  if (!fileDataUrl) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const match     = fileDataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  const mediaType = match?.[1] ?? 'image/jpeg';
  const base64    = match?.[2] ?? fileDataUrl;

  const isPdf = mediaType === 'application/pdf';

  const prompt = [
    `Tu es une experte en couture et en patrons de couture.`,
    isPdf
      ? `Ce document PDF contient un ou plusieurs patrons de couture.`
      : `Cette image contient un patron de couture.`,
    size
      ? `L'utilisatrice souhaite coudre la taille ${size}.`
      : `Utilise la taille médiane disponible sur le patron.`,
    ``,
    `ÉTAPE 1 — Identifie le type de vêtement (robe, blouse, pantalon, manteau…).`,
    ``,
    `ÉTAPE 2 — Liste CHAQUE pièce du patron séparément, en les nommant individuellement :`,
    `  • "Manche droite" et "Manche gauche" au lieu de "Manche ×2"`,
    `  • "Devant", "Dos", "Côté devant gauche", "Côté devant droit" selon la coupe`,
    `  • "Col", "Col (dessus)", "Col (dessous)" si applicable`,
    `  • Chaque pièce doit avoir un nom distinct et descriptif`,
    ``,
    `Pour chaque pièce, fournis :`,
    `- name : nom précis en français (ex: "Devant", "Dos", "Manche droite", "Col")`,
    `- width_cm : largeur de la boîte englobante en cm`,
    `- height_cm : hauteur de la boîte englobante en cm`,
    `- area_cm2 : surface RÉELLE estimée de la pièce en cm² (en tenant compte de la forme exacte : pince, courbe, échancrure, etc.) — ce doit être inférieur ou égal à width_cm × height_cm`,
    `- quantity : 1 (chaque pièce est listée individuellement)`,
    `- on_fold : true seulement si la pièce est représentée en demi (à couper sur le pli du tissu)`,
    `- shape : type de forme dominant — "rectangle" | "trapeze" | "triangle" | "curved" | "irregular"`,
    `- notes : courte note (grain de droit, asymétrie, entoilage…) — vide si rien à signaler`,
    ``,
    `Référence mensuration taille ${size || 'médiane'} (EU femme) :`,
    `poitrine ≈ ${sizeChart(size, 'bust')} cm | taille ≈ ${sizeChart(size, 'waist')} cm | hanches ≈ ${sizeChart(size, 'hip')} cm`,
    ``,
    `IMPORTANT : si tu ne peux pas voir le patron clairement, estime des dimensions typiques pour ce vêtement et cette taille.`,
    ``,
    `Réponds UNIQUEMENT avec un objet JSON valide, sans markdown :`,
    `{`,
    `  "garment_type": "robe",`,
    `  "pieces": [`,
    `    {"name":"Devant","width_cm":48,"height_cm":62,"area_cm2":2400,"quantity":1,"on_fold":true,"shape":"trapeze","notes":"grain de droit vertical"},`,
    `    {"name":"Dos","width_cm":46,"height_cm":60,"area_cm2":2280,"quantity":1,"on_fold":true,"shape":"trapeze","notes":""},`,
    `    {"name":"Manche droite","width_cm":22,"height_cm":54,"area_cm2":850,"quantity":1,"on_fold":false,"shape":"curved","notes":""},`,
    `    {"name":"Manche gauche","width_cm":22,"height_cm":54,"area_cm2":850,"quantity":1,"on_fold":false,"shape":"curved","notes":""}`,
    `  ]`,
    `}`,
  ].join('\n');

  const imageContent = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        ...(isPdf ? { 'anthropic-beta': 'pdfs-2024-09-25' } : {}),
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: [imageContent, { type: 'text', text: prompt }] }],
      }),
    });

    const data = await res.json() as {
      content?: { type: string; text: string }[];
      error?: { type: string; message: string };
      type?: string;
    };

    /* L'API a retourné une erreur HTTP */
    if (!res.ok || data.error) {
      const msg = data.error?.message ?? `HTTP ${res.status}`;
      return NextResponse.json({ error: `Erreur API Anthropic : ${msg}` }, { status: 502 });
    }

    const text = data.content?.find(c => c.type === 'text')?.text ?? '';

    /* Essaie d'extraire le JSON même si Claude ajoute du texte autour */
    const jsonMatch = text.match(/\{[\s\S]*\}/) ?? text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      const preview = text.slice(0, 400) || '(réponse vide)';
      return NextResponse.json({ error: `Réponse IA non analysable : ${preview}` }, { status: 502 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      garment_type?: string;
      pieces?: {
        name: string;
        width_cm: number;
        height_cm: number;
        area_cm2?: number;
        quantity: number;
        on_fold: boolean;
        shape?: string;
        notes?: string;
      }[];
    };

    const pieces = parsed.pieces ?? [];
    const garment_type = parsed.garment_type ?? 'autres';

    return NextResponse.json({ pieces, garment_type });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** Mensurations de référence par taille (femme EU) */
function sizeChart(size: string, measurement: 'bust' | 'waist' | 'hip'): number {
  const chart: Record<string, [number, number, number]> = {
    '34': [82, 64, 90],  '36': [86, 68, 94],  '38': [90, 72, 98],
    '40': [94, 76, 102], '42': [98, 80, 106], '44': [102, 84, 110],
    '46': [106, 88, 114],'48': [110, 92, 118],'50': [114, 96, 122],
  };
  const row = chart[size];
  if (!row) return measurement === 'bust' ? 90 : measurement === 'waist' ? 72 : 98;
  return measurement === 'bust' ? row[0] : measurement === 'waist' ? row[1] : row[2];
}
