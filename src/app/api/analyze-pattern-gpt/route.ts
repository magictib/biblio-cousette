import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY non configurée — ajoutez-la dans les variables d\'environnement Vercel.' },
      { status: 500 }
    );
  }

  const body = await request.json() as {
    imageDataUrl?: string;
    fabricWidthCm: number;
    fabricLengthM: number;
    size: string;
    version?: string;
    garmentSubtype?: string;
    stretchDirection?: string;
  };

  const prompt = [
    'Tu es une experte en couture, spécialisée dans les patrons Cousette (marque française de lingerie et loungewear).',
    '',
    'Paramètres du projet :',
    `- Largeur tissu (laize) : ${body.fabricWidthCm} cm`,
    `- Longueur tissu disponible : ${body.fabricLengthM.toFixed(2)} m`,
    `- Taille : ${body.size}`,
    body.version         ? `- Version du patron : ${body.version}`          : null,
    body.garmentSubtype  ? `- Type de vêtement : ${body.garmentSubtype}`    : null,
    body.stretchDirection ? `- Extensibilité du tissu : ${body.stretchDirection}` : null,
    '',
    body.imageDataUrl
      ? 'Un extrait du patron est joint en image. Analyse précisément les pièces à découper pour les paramètres ci-dessus.'
      : 'En te basant sur les paramètres et ta connaissance des patrons Cousette, liste toutes les pièces à découper.',
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

  type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail: string } };

  let content: string | ContentBlock[];
  if (body.imageDataUrl) {
    const mime = body.imageDataUrl.match(/^data:([^;]+);/)?.[1] ?? '';
    if (mime.startsWith('image/')) {
      content = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: body.imageDataUrl, detail: 'high' } },
      ];
    } else {
      content = prompt;
    }
  } else {
    content = prompt;
  }

  try {
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

    if (!res.ok || data.error) {
      return NextResponse.json(
        { error: `Erreur API OpenAI : ${data.error?.message ?? res.status}` },
        { status: 502 }
      );
    }

    const text = data.choices?.[0]?.message?.content ?? '';
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) {
      return NextResponse.json(
        { error: `Réponse IA non analysable : ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(m[0]) as {
      garment_type?: string;
      pieces?: {
        name: string; width_cm: number; height_cm: number;
        area_cm2?: number; quantity: number; on_fold: boolean;
        shape?: string; notes?: string;
      }[];
    };

    return NextResponse.json({
      garment_type: parsed.garment_type ?? 'autres',
      pieces: parsed.pieces ?? [],
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
