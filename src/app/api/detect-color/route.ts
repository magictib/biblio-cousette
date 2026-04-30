import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-1.5-flash';

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY manquante' }, { status: 500 });

  const { imageDataUrl } = await request.json() as { imageDataUrl: string };
  if (!imageDataUrl) return NextResponse.json({ error: 'Image manquante' }, { status: 400 });

  const match     = imageDataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  const mediaType = match?.[1] ?? 'image/jpeg';
  const base64    = match?.[2] ?? imageDataUrl;

  const prompt = `Analyse cette photo de tissu et identifie sa couleur dominante.
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown :
{"hex": "#RRGGBB", "name": "nom de la couleur en français"}
Exemples : {"hex": "#4A90D9", "name": "bleu roi"} ou {"hex": "#F5E6D3", "name": "beige ivoire"}`;

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
        generationConfig: { temperature: 0.1, maxOutputTokens: 100 },
      }),
    });

    const data = await res.json() as {
      candidates?: { content: { parts: { text: string }[] } }[];
      error?: { message: string };
    };

    if (!res.ok || data.error) {
      return NextResponse.json({ error: `Erreur Gemini : ${data.error?.message ?? res.status}` }, { status: 502 });
    }

    const text       = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const jsonMatch  = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Réponse IA non analysable' }, { status: 502 });

    const result = JSON.parse(jsonMatch[0]) as { hex?: string; name?: string };
    if (!result.hex?.match(/^#[0-9A-Fa-f]{6}$/)) {
      return NextResponse.json({ error: 'Couleur invalide retournée' }, { status: 502 });
    }
    return NextResponse.json({ hex: result.hex, name: result.name ?? '' });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
