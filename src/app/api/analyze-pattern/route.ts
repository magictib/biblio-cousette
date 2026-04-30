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
    `Identifie TOUTES les pièces du patron et estime leurs dimensions pour la taille choisie.`,
    `Pour chaque pièce :`,
    `- name : nom de la pièce en français (ex: "Devant", "Dos", "Manche", "Col", "Poche")`,
    `- width_cm : largeur en cm de la boîte englobante pour la taille sélectionnée`,
    `- height_cm : hauteur en cm de la boîte englobante`,
    `- quantity : nombre de fois à couper (1 ou 2 généralement)`,
    `- on_fold : true si la pièce se coupe sur le pli (la pièce est une demi-pièce)`,
    `- notes : courte note facultative`,
    ``,
    `Référence pour la taille ${size || 'médiane'} :`,
    `poitrine ≈ ${sizeChart(size, 'bust')} cm | taille ≈ ${sizeChart(size, 'waist')} cm | hanches ≈ ${sizeChart(size, 'hip')} cm`,
    ``,
    `IMPORTANT : si tu ne peux pas voir le patron clairement, estime les dimensions typiques pour ce type de vêtement et cette taille.`,
    ``,
    `Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown :`,
    `[{"name":"Devant","width_cm":48,"height_cm":62,"quantity":1,"on_fold":true,"notes":""},...]`,
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
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 1024,
        messages: [{ role: 'user', content: [imageContent, { type: 'text', text: prompt }] }],
      }),
    });

    const data = await res.json() as { content?: { text: string }[] };
    const text = data.content?.[0]?.text ?? '';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse IA non analysable', raw: text }, { status: 502 });
    }

    const pieces = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ pieces });

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
