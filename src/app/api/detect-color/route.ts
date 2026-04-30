import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 });

  const { imageDataUrl } = await request.json() as { imageDataUrl: string };
  if (!imageDataUrl) return NextResponse.json({ error: 'Image manquante' }, { status: 400 });

  const match     = imageDataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  const mediaType = match?.[1] ?? 'image/jpeg';
  const base64    = match?.[2] ?? imageDataUrl;

  const prompt = `Analyse cette photo de tissu et identifie sa couleur dominante.
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni explication :
{"hex": "#RRGGBB", "name": "nom de la couleur en français"}

Exemples : {"hex": "#4A90D9", "name": "bleu roi"} ou {"hex": "#F5E6D3", "name": "beige ivoire"}
Le code hex doit être exactement 6 caractères hexadécimaux précédés de #.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    const data = await res.json() as { content?: { text: string }[] };
    const text  = data.content?.[0]?.text ?? '';
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Réponse IA non analysable', raw: text }, { status: 502 });

    const result = JSON.parse(jsonMatch[0]) as { hex?: string; name?: string };
    if (!result.hex?.match(/^#[0-9A-Fa-f]{6}$/)) {
      return NextResponse.json({ error: 'Couleur invalide retournée' }, { status: 502 });
    }
    return NextResponse.json({ hex: result.hex, name: result.name ?? '' });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
