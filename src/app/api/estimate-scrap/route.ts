import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY non configurée — ajoutez-la dans .env.local' },
      { status: 500 }
    );
  }

  const { imageDataUrl } = await request.json() as { imageDataUrl: string };
  if (!imageDataUrl) {
    return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
  }

  /* Extraire le type MIME et les données base64 */
  const match     = imageDataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  const mediaType = (match?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  const base64    = match?.[2] ?? imageDataUrl;

  const body = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        {
          type: 'text',
          text: [
            'Tu es une experte en couture.',
            'Estime la surface en cm² de la chute de tissu visible sur cette photo.',
            'Suppose que le tissu est posé à plat.',
            'Réponds UNIQUEMENT avec un objet JSON, sans markdown :',
            '{"area_cm2": number, "confidence": "faible"|"moyen"|"élevé", "note": "explication courte en français"}',
          ].join(' '),
        },
      ],
    }],
  };

  try {
    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json() as { content?: { text: string }[] };
    const text = data.content?.[0]?.text ?? '';

    /* Extraire le JSON de la réponse */
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse IA non analysable', raw: text }, { status: 502 });
    }

    const result = JSON.parse(jsonMatch[0]) as { area_cm2: number; confidence: string; note: string };
    return NextResponse.json(result);

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
