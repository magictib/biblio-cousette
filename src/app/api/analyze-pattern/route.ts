import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-1.5-flash';

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY non configurée — ajoutez-la dans .env.local' },
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
    `- name : nom précis en français`,
    `- width_cm : largeur de la boîte englobante en cm`,
    `- height_cm : hauteur de la boîte englobante en cm`,
    `- area_cm2 : surface réelle estimée en cm² (tenant compte courbes, pinces, etc.)`,
    `- quantity : 1 (chaque pièce listée individuellement)`,
    `- on_fold : true si la pièce est en demi (à couper sur le pli)`,
    `- shape : "rectangle" | "trapeze" | "triangle" | "curved" | "irregular"`,
    `- notes : courte note (grain de droit, entoilage…) — vide si rien`,
    ``,
    `Référence mensuration taille ${size || 'médiane'} (EU femme) :`,
    `poitrine ≈ ${sizeChart(size, 'bust')} cm | taille ≈ ${sizeChart(size, 'waist')} cm | hanches ≈ ${sizeChart(size, 'hip')} cm`,
    ``,
    `IMPORTANT : si le patron n'est pas clairement visible, estime des dimensions typiques pour ce vêtement et cette taille.`,
    ``,
    `Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni backticks :`,
    `{"garment_type":"robe","pieces":[{"name":"Devant","width_cm":48,"height_cm":62,"area_cm2":2400,"quantity":1,"on_fold":true,"shape":"trapeze","notes":""},{"name":"Manche droite","width_cm":22,"height_cm":54,"area_cm2":850,"quantity":1,"on_fold":false,"shape":"curved","notes":""}]}`,
  ].join('\n');

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: mediaType, data: base64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
      }),
    });

    const data = await res.json() as {
      candidates?: { content: { parts: { text: string }[] } }[];
      error?: { message: string };
    };

    if (!res.ok || data.error) {
      return NextResponse.json({ error: `Erreur API Gemini : ${data.error?.message ?? res.status}` }, { status: 502 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const preview = text.slice(0, 400) || '(réponse vide)';
      return NextResponse.json({ error: `Réponse IA non analysable : ${preview}` }, { status: 502 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      garment_type?: string;
      pieces?: {
        name: string; width_cm: number; height_cm: number;
        area_cm2?: number; quantity: number; on_fold: boolean;
        shape?: string; notes?: string;
      }[];
    };

    return NextResponse.json({
      pieces:       parsed.pieces      ?? [],
      garment_type: parsed.garment_type ?? 'autres',
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

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
